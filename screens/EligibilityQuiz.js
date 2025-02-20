import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BottomBar from '../components/BottomBar';
import quizData from '../data/quizQuestions.json';

const EligibilityQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const currentQuestion = quizData[currentQuestionIndex];

  // Save answer for current question
  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  // Render input based on question type
  const renderInputForQuestion = (question) => {
    switch (question.type) {
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
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={answers[question.id] || ''} onChangeText={handleAnswer}/>
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
  const finishQuiz = () => {
    const score = calculateTotalScore();
    setTotalScore(score);
    setShowResult(true);
  };

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

  return (
    <SafeAreaView style={styles.container}>
      {/* When quiz is complete */}
      {showResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your score: {totalScore} / 35</Text>
          <Text style={styles.resultEligibility}>{totalScore > 10 ? "Eligible" : "Not Eligible"}</Text> {/* Eligible if score above 10 */}
          <Button title="Restart Quiz" onPress={() => {setAnswers({}); setCurrentQuestionIndex(0); setShowResult(false);}} /> {/* Restart Button */}
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