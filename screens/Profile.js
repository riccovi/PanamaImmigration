import { useState, useEffect } from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';

const quiz_progress_key = 'quiz_progress';

const Profile = () => {
  const [quizData, setQuizData] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(quiz_progress_key);
        if (savedProgress) {
          const { savedAnswers } = JSON.parse(savedProgress);
          setQuizData(savedAnswers);

          // Check if all required fields are answered
          const allQuestionsAnswered = Object.keys(savedAnswers).length === 16; 
          setQuizCompleted(allQuestionsAnswered);
        }
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
      }
    };

    loadQuizData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {Object.keys(quizData).length > 0 ? (
        <>
          <Text style={styles.profileText}>Name: {quizData['name'] || 'Not provided'}</Text>
          <Text style={styles.profileText}>Country of Citizenship: {quizData['citizenship'] || 'Not provided'}</Text>
          <Text style={styles.profileText}>Educational Qualifications: {quizData['education'] || 'Not provided'}</Text>
          <Text style={styles.profileText}>Work Experience: {quizData['experience'] || 'Not provided'}</Text>
          <Text style={styles.profileText}>Language Proficiency: {quizData['language'] || 'Not provided'}</Text>

          {!quizCompleted && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>⚠️ You haven't completed the quiz yet!</Text>
              <Button title="Complete Quiz" onPress={() => navigation.navigate('EligibilityQuiz')} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>❗ Please fill out the eligibility quiz first.</Text>
          <Button title="Start Quiz" onPress={() => navigation.navigate('EligibilityQuiz')} />
        </View>
      )}
      <BottomBar />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
     flex: 1, 
     padding: 20, 
     backgroundColor: '#fff' 
    },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  profileText: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  warningContainer: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#ffcccb', 
    borderRadius: 5 
  },
  warningText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#d9534f' 
  },
});