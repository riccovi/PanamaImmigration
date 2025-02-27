import { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width } = Dimensions.get('window');

const quiz_progress_key = 'quiz_progress';

const Profile = ({ route }) => {
  const { userDetails } = route.params || {};
  const [quizData, setQuizData] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
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
              <Button title="Complete Quiz" onPress={() => navigation.navigate('EligibilityQuiz', { userDetails })} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>❗ Please fill out the eligibility quiz first.</Text>
          <Button title="Start Quiz" onPress={() => navigation.navigate('EligibilityQuiz', { userDetails })} />
        </View>
      )}

      </ScrollView>
      <BottomBar userDetails={userDetails}/>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryWhite, 
    padding: width * 0.05,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: width * 0.05,
    paddingBottom: width * 0.1, 
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: '700',
    marginVertical: width * 0.025,
    textAlign: 'center', 
    width: '100%',
    color: colors.primaryBlack
  },
  detailsContainer: {
    width: '100%',
    marginVertical: width * 0.05,
    borderWidth: 1,
    borderColor: colors.greyBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBlue,
    backgroundColor: 'white',
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    backgroundColor: colors.primaryWhite,
  },
  detailLabel: {
    flex: 1,
    fontSize: width * 0.05,
    fontWeight: '600',
    color: colors.primaryBlack,
  },
  detailValue: {
    flex: 1,
    fontSize: width * 0.05,
    color: colors.primaryBlack,
    textAlign: 'right',
  },
  warningContainer: {
    marginVertical: width * 0.05,
    padding: width * 0.04,
    backgroundColor: '#ffcccb',
    borderRadius: 5,
    alignSelf: 'stretch',
  },
  warningText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
});