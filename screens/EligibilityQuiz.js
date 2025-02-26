import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';
import quizData from '../data/quizQuestions.json';

const quiz_progress_key = 'quiz_progress';

const EligibilityQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const currentQuestion = quizData[currentQuestionIndex];
  const allCountries = ["Afghanistan", "Albania", "Algeria"];

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
    //setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
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
              <Picker.Item label="Miss" value="Miss" />
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
            
            </Picker>
          </View>
        );
      // yesno type
      case 'yesno':
        return (
          <View style={styles.yesNoContainer}>
            <TouchableOpacity style={styles.yesNoButton} onPress={() => handleAnswer("yes")}>
              <Text style={styles.yesNoText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesNoButton} onPress={() => handleAnswer("no")}>
              <Text style={styles.yesNoText}>No</Text>
            </TouchableOpacity>
          </View>
        );
      // date type
      case 'date':
        return (
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" keyboardType="numeric" value={answers[question.id] || ''} onChangeText={handleAnswer}/>
        ); 
      default:
        return null;
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
    // Special cases: Age (Question 4), language skills (Questions 12 and 13)
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
  {/*
  // Navigation
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) { // If not at first question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const goToNext = () => { // If not at last question
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  */}

  return (
    <SafeAreaView style={styles.container}>
      {/* When quiz is complete */}
      {showResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your score: {totalScore} / 35</Text>
          <Text style={styles.resultEligibility}>{totalScore > 10 ? "Eligible" : "Not Eligible"}</Text> {/* Eligible if score above 10 */}
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
          <ScrollView horizontal style={styles.scrollbar}> {/* Horizontal Scrollbar */}
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
      <BottomBar />
    </SafeAreaView>
  )
}

export default EligibilityQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },

  questionContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  questionText: { 
    fontSize: 22, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: { 
    width: '80%', 
    height: 50, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    paddingHorizontal: 10, 
    marginBottom: 20, 
    borderRadius: 5 
  },

  dropdownContainer: { 
    width: '80%', 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: 20 
  },
  picker: { 
    width: '100%', 
    height: 50 
  },

  compoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  compoundInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  prefixContainer: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 5,
    minWidth: 60
  },
  prefixPicker: {
    height: 50,
    width: '100%',
  },
  nameInputContainer: {
    flex: 2,
    marginHorizontal: 5,
  },

  yesNoContainer: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  yesNoButton: { 
    backgroundColor: '#1EB1FC', 
    padding: 10, 
    borderRadius: 5, 
    marginHorizontal: 10 
  },
  yesNoText: { 
    color: '#fff', 
    fontSize: 16 
  },

  navigationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },

  scrollbar: { 
    marginTop: 10 
  },
  scrollbarItem: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#ccc', 
    marginHorizontal: 5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  answeredScrollbarItem: {
    backgroundColor: 'green', 
  },
  activeScrollbarItem: { 
    borderWidth: 2,
    borderColor: 'blue'
  },
  disabledScrollbarItem: {
    opacity: 0.5
  }, 
  scrollbarText: { 
    fontSize: 16, 
    color: '#fff' 
  },

  resultContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  resultText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  resultEligibility: { 
    fontSize: 24, 
    marginBottom: 20 
  }
});