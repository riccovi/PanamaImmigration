import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import BottomBar from '../components/BottomBar';
import quizData from '../data/quizQuestions.json';
import YouTube from 'react-native-youtube-iframe';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../components/colors';

const { width, height } = Dimensions.get('window');

const quiz_progress_key = 'quiz_progress';

const EligibilityQuiz = ({ route }) => {
  const { userDetails } = route.params || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const currentQuestion = quizData[currentQuestionIndex];
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [internetConnected, setInternetConnected] = useState(true);

  // Internet connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      //console.log('Connection type:', state.type);
      //console.log('Is internet reachable:', state.isInternetReachable);
      if (internetConnected !== state.isInternetReachable) {
        setInternetConnected(state.isInternetReachable);
      }
    });
    return () => unsubscribe();
  }, [internetConnected]);

  // Load progress when component is used
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(quiz_progress_key);
        if (savedProgress) {
          const { savedIndex, savedAnswers } = JSON.parse(savedProgress);
          setCurrentQuestionIndex(savedIndex);
          setAnswers(savedAnswers);
        } 
      } catch (error) {
          console.error('Failed to load quiz progress:', error);
        }
      }
    loadProgress();
  }, []);

  // Save progress to AsyncStorage  
  const saveProgress = async (index, userAnswers) => {
    try {
      const progressData = JSON.stringify({ savedIndex: index, savedAnswers: userAnswers });
      await AsyncStorage.setItem(quiz_progress_key, progressData);
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
    }
  };
  
  // Save answer for current question
  const handleAnswer = (answer) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);
    saveProgress(currentQuestionIndex, updatedAnswers)
  };
  
  // Render input based on question type
  const renderInputForQuestion = (question) => {
    switch (question.type) {
      // compound type
      case 'compound':
      return (
        <View style={styles.compoundContainer}>
          {/* Dropdown for prefix */}
          <View style={styles.prefixContainer}>
            <Picker selectedValue={answers[question.id]?.prefix || ''} style={styles.prefixPicker} onValueChange={(itemValue) => setAnswers(prev => ({...prev, [question.id]: {...prev[question.id], prefix: itemValue}}))}>
              <Picker.Item label="Mr" value="Mr" />
              <Picker.Item label="Mrs" value="Mrs" />
              <Picker.Item label="Ms" value="Ms" />
              <Picker.Item label="Sir" value="Sir" />
              <Picker.Item label="Dr" value="Dr" />
            </Picker>
          </View>
          {/* TextInput for first name */}
          <View style={styles.nameInputContainer}>
            <TextInput style={styles.compoundInput} placeholder="First Name" value={answers[question.id]?.firstName || ''} onChangeText={(text) => setAnswers(prev => ({...prev,[question.id]: { ...prev[question.id],firstName: text}}))}/>
          </View>
          {/* TextInput for surname */}
          <View style={styles.nameInputContainer}>
            <TextInput style={styles.compoundInput} placeholder="Surname" value={answers[question.id]?.surname || ''} onChangeText={(text) => setAnswers(prev => ({...prev,[question.id]: { ...prev[question.id],surname: text}}))}/>
          </View>
        </View>
      );
      // text type
      case 'text':
        return (
          <TextInput style={styles.input} placeholder="Enter your answer" value={answers[question.id] || ''} onChangeText={handleAnswer}/>
        );
      // number type
      case 'number':
        return (
          <TextInput style={styles.input} placeholder="Enter a number" keyboardType="numeric" value={answers[question.id] ? String(answers[question.id]) : ''} onChangeText={handleAnswer}/>
        );
      // dropdown type
      case 'dropdown':
        return (
          <View style={styles.dropdownContainer}>
            <Picker selectedValue={answers[question.id] || ''} style={styles.picker} onValueChange={(itemValue) => handleAnswer(itemValue)}>
              <Picker.Item label="Select an option" value="" />
              {question.options.map((option, index) => (<Picker.Item key={index} label={option} value={option} />))}
              {question.id === 2 && (<Picker.Item label={question.otherOption || "Other"} value="Other" />)}
            </Picker>
          </View>
        );
      // yesno type
      case 'yesno':
        return (
          <View style={styles.yesNoContainer}>
            <TouchableOpacity style={styles.yesNoButton} onPress={() => handleAnswer("Yes")}>
              <Text style={styles.yesNoText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesNoButton} onPress={() => handleAnswer("No")}>
              <Text style={styles.yesNoText}>No</Text>
            </TouchableOpacity>
          </View>
        );
      // date type
      case 'date':
        return (
          <View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{dob ? dob.toDateString() : "Select Date of Birth"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker testID="dateTimePicker" value={dob || new Date()} mode="date" display="default" onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDob(selectedDate);
                    // Save in YYYY-MM-DD format
                    handleAnswer(selectedDate.toISOString().split('T')[0]);
                  }
                }}/>
            )}
          </View>
        );
    }
  };

  // Calculate score for each question
  const calculateScoreForQuestion = (question, answer) => {
    if (!answer){return 0;} // If null
    if (question.points !== undefined){return question.points;}
    if (question.pointsMapping) { // For yesno and dropwdown questoins
      if (question.type === 'yesno') {
        return question.pointsMapping[answer.toLowerCase()] || 0;
      }
      if (question.type === 'dropdown') {
        return question.pointsMapping[answer] || 0;
      }
    }
    // Special cases: Country (Question 2), Age (Question 4), language skills (Questions 12 and 13)
    if (question.id === 2) { // Country
      if (answer === "Other") { 
        return 0;
      } // If 'other' option is selected, score 0 points. If an available country is selected, score 3 points.
      return question.options.includes(answer) ? 3 : 0;
    }
    if (question.id === 4) { // Age
      const age = parseInt(answer, 10);
      if (age >= 18 && age <= 30){return 2;} // If age between 18 and 30, 2 points
      if (age > 30 && age <= 50){return 1;} // If age between 30 and 50, 1 point
      return 0;
    }
    if (question.id === 12 || question.id === 13) { // Language skills
      const score = parseInt(answer, 10);
      if (score === 10){return 2;} // If scored 10, 2 points
      if (score >= 7 && score <= 9){return 1;} // If scored 7-9, 1 point
      return 0;
    }
    return 0;
  };

  // Tally total score
  const calculateTotalScore = () => {
    let score = 0;
    quizData.forEach(question => {
      const answer = answers[question.id];
      score += calculateScoreForQuestion(question, answer);
    });
    return score;
  };

  // Finish Quiz
  const finishQuiz = async () => {
    const score = calculateTotalScore();
    setTotalScore(score);
    setShowResult(true);
    await AsyncStorage.setItem('quiz_total_score', JSON.stringify(totalScore));
    try{
      await AsyncStorage.setItem('quiz_answers', JSON.stringify(answers));
    } catch (error){
      console.error('Failed to save final quiz answers:', error);
    }
  };

  // Navigation
  const goToPrevious = () => {
    if (currentQuestion.id === 4) { // Age validation
      const age = parseInt(answers[4],10);
      if (isNaN(age) || age < 18 || age > 99){
        alert('Please enter a valid age')
        return;
      }
    }
    if (currentQuestionIndex > 0) { // If not at first question
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev - 1;
        saveProgress(newIndex, answers);
        return newIndex;
      });
    }
  };

  const goToNext = () => {
    if (currentQuestion.id === 4) { // Age validation
      const age = parseInt(answers[4],10);
      if (isNaN(age) || age < 18 || age > 99){
        alert('Please enter a valid age')
        return;
      }
    }
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => { // If not at last question
        const newIndex = prev + 1;
        saveProgress(newIndex, answers);
        return newIndex;
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
      {/* When quiz is complete */}
      {showResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your score: {totalScore} / 35</Text>
          <Text style={styles.resultEligibility}>{totalScore > 10 ? `You are eligible to immigrate to Panama!` : "Unfortunately, you are not eligible to immigrate to Panama with your current status. Please contact us for further help."}</Text> {/* Eligible if score above 10 */}
          <Button title="Restart Quiz" onPress={() => {setAnswers({}); setCurrentQuestionIndex(0); setShowResult(false); saveProgress(0, {});}} /> {/* Restart Button */}
        </View>
      ) : (
        <>
        {/* Completing quiz */}
          <View style={styles.questionContainer}> {/* Display Question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {renderInputForQuestion(currentQuestion)}
          </View>
          <View style={styles.navigationContainer}> {/* Display Navigation */}
            <Button title="Previous" onPress={goToPrevious} disabled={currentQuestionIndex === 0} />
            {currentQuestionIndex < quizData.length - 1 ? (
              <Button title="Next" onPress={goToNext} disabled={!answers[currentQuestion.id]}/>
            ) : (
              <Button title="Finish" onPress={finishQuiz} disabled={!answers[currentQuestion.id]}/>
            )}
          </View>
          {/* Horizontal Scrollbar */}
          <ScrollView horizontal style={styles.scrollbar}> 
            <View style={{ flexDirection: 'row' }}>
              {quizData.map((question, index) => {
                const answered = answers[question.id] !== undefined;
                const accessible = (index <= currentQuestionIndex) || answered; // Accessible if current question, before current question, or answered
                return (
                <TouchableOpacity key={question.id} style={[styles.scrollbarItem, answered && styles.answeredScrollbarItem, index === currentQuestionIndex && styles.activeScrollbarItem, !accessible && styles.disabledScrollbarItem]} onPress={() => { if (accessible) setCurrentQuestionIndex(index); }} disabled={!accessible}>
                  <Text style={styles.scrollbarText}>{index + 1}</Text>
                </TouchableOpacity>
              )})}
            </View>
          </ScrollView>
        </>
      )}
      {/* Youtube Video */}
      {internetConnected ? (
        <View style={styles.videoContainer}>
          <YouTube videoId="tq4qc7wYy8o?si=n0BVYKFnsj6-gTY7" height={200} play={false} webViewProps={{allowsInlineMediaPlayback: true}}/>
        </View>
      ) : (
        <Text style={styles.videoPlaceholderText}>Internet connection required to view the eligibility process video.</Text>
      )}
      </ScrollView>
      <BottomBar userDetails={userDetails}/>
    </SafeAreaView>
  )
}

export default EligibilityQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: height * 0.03, 
    paddingBottom: height * 0.05,
    backgroundColor: colors.primaryWhite, 
  },
  contentContainer: {
    flexGrow: 1,
    marginBottom:  height * 0.03
  },
  questionContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  questionText: { 
    fontSize: Math.max(16, Math.min(width * 0.055, 24)), 
    marginBottom: height * 0.03, 
    textAlign: 'center' ,
    color: colors.primaryBlack
  },
  input: { 
    width: '80%', 
    height: height * 0.09, 
    borderColor: colors.greyBorder, 
    borderWidth: 1, 
    paddingHorizontal: width * 0.03, 
    marginBottom: height * 0.03, 
    borderRadius: 5,
    minHeight: 40,
    maxHeight: 60, 
  },

  dropdownContainer: { 
    width: '80%', 
    borderColor: colors.greyBorder, 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: height * 0.03 
  },
  picker: { 
    width: '100%', 
    height: height * 0.1
  },

  compoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.02,
  },
  compoundInput: {
    height: height * 0.07,
    borderColor: colors.greyBorder,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.03,
  },
  prefixContainer: {
    flex: 1,
    height: width * 0.15,
    borderColor: colors.greyBorder,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: width * 0.01,
    minWidth: width * 0.1,
  },
  prefixPicker: {
    height:  height * 0.07,
    width: '100%',
  },
  nameInputContainer: {
    flex: 2,
    marginHorizontal: width * 0.01,
  },

  yesNoContainer: { 
    flexDirection: 'row', 
    marginBottom: height * 0.03 
  },
  yesNoButton: { 
    backgroundColor: colors.primaryBlue, 
    padding: height * 0.02, 
    borderRadius: 5, 
    marginHorizontal: width * 0.08,
    minHeight: 40,
    maxHeight: 60,
  },
  yesNoText: { 
    color: colors.primaryWhite, 
    fontSize: Math.max(14, Math.min(width * 0.04, 18)),
  },

  navigationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: height * 0.03
  },

  scrollbar: { 
    marginTop: height * 0.01
  },
  scrollbarItem: { 
    width: width * 0.13, 
    height: width * 0.13, 
    borderRadius: width * 0.08, 
    backgroundColor: colors.greyBorder, 
    marginHorizontal: width * 0.015, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  answeredScrollbarItem: {
    backgroundColor: 'green', 
  },
  activeScrollbarItem: { 
    borderWidth: 2,
    borderColor: colors.primaryBlue
  },
  disabledScrollbarItem: {
    opacity: 0.5
  }, 
  scrollbarText: { 
    fontSize:  Math.max(12, Math.min(width * 0.04, 16)), 
    color: colors.primaryWhite 
  },

  resultContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  resultText: { 
    fontSize: Math.max(18, Math.min(width * 0.07, 26)),
    fontWeight: 'bold', 
    marginBottom: height * 0.02,
    color: colors.primaryBlack
  },
  resultEligibility: { 
    fontSize: Math.max(16, Math.min(width * 0.06, 24)),
    marginBottom:  height * 0.03,
    color: colors.primaryBlack
  },

  dateButton: {
    backgroundColor: colors.primaryBlue,
    padding: height * 0.02,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: height * 0.03,
    minHeight: 40,
    maxHeight: 60,
  },
  dateButtonText: {
    color: colors.primaryWhite,
    fontSize: Math.max(14, Math.min(width * 0.04, 18)),
  },

  videoContainer: {
    alignSelf: 'stretch',
  },
  videoPlaceholderText: {
    textAlign: 'center',
    fontSize: Math.max(16, Math.min(width * 0.05, 22)),
    color: colors.primaryBlack
  },
});