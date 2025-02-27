import { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';

const quiz_progress_key = 'quiz_progress';

const Profile = () => {
  const [quizData, setQuizData] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const savedProgress = await AsyncStorage.getItem(quiz_progress_key);
          if (savedProgress) {
            const { savedAnswers } = JSON.parse(savedProgress);
            setQuizData(savedAnswers);
            setQuizCompleted(Object.keys(savedAnswers).length === 16);
          }
          //Total Score
          const savedScore = await AsyncStorage.getItem('quiz_total_score');
          if (savedScore) {
            setTotalScore(JSON.parse(savedScore));
          }
          
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Profile</Text>

      {Object.keys(quizData).length > 0 ? (
        <>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{quizData["1"] ? `${quizData["1"].prefix || ""} ${quizData["1"].firstName || ""} ${quizData["1"].surname || ""}`.trim(): "Not provided"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Country of Citizenship:</Text>
            <Text style={styles.detailValue}>{quizData["2"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Educational Qualifications:</Text>
            <Text style={styles.detailValue}>{quizData["3"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Age:</Text>
            <Text style={styles.detailValue}>{quizData["4"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date of Birth:</Text>
            <Text style={styles.detailValue}>{quizData["5"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Marital Status:</Text>
            <Text style={styles.detailValue}>{quizData["6"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dependents under 12:</Text>
            <Text style={styles.detailValue}>{quizData["7"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dependents over 12:</Text>
            <Text style={styles.detailValue}>{quizData["8"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contract of employment:</Text>
            <Text style={styles.detailValue}>{quizData["9"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Real estate above $300,000:</Text>
            <Text style={styles.detailValue}>{quizData["10"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>English skills:</Text>
            <Text style={styles.detailValue}>{`${quizData["12"]}/10` || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spanish skills:</Text>
            <Text style={styles.detailValue}>{`${quizData["13"]}/10` || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Health issues:</Text>
            <Text style={styles.detailValue}>{quizData["14"] || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criminal record: </Text>
            <Text style={styles.detailValue}>{quizData["15"] || 'Not provided'}</Text>
          </View>
        </View>

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

      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center', 
    padding: 20,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40, 
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 10,
    textAlign: 'center', 
    width: '100%' //
  },
  detailsContainer: {
    width: '100%',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    backgroundColor: '#f9f9f9',
  },
  detailLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    textAlign: 'right',
  },
  warningContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#ffcccb',
    borderRadius: 5,
    alignSelf: 'stretch',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
});