import { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width, height } = Dimensions.get('window');

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

   // Mapping array for profile details
   const detailsMapping = [
    { key: "1", label: "Name", format: (data) => data ? `${data.prefix || ""} ${data.firstName || ""} ${data.surname || ""}`.trim() : "Not provided"},
    { key: "2", label: "Country of Citizenship:" },
    { key: "3", label: "Educational Qualifications:" },
    { key: "4", label: "Age:" },
    { key: "5", label: "Date of Birth:" },
    { key: "6", label: "Marital Status:" },
    { key: "7", label: "Dependents under 12:" },
    { key: "8", label: "Dependents over 12:" },
    { key: "9", label: "Contract of employment:" },
    { key: "10", label: "Real estate above $300,000:" },
    { key: "12", label: "English skills:", format: (value) => (value ? `${value}/10` : "Not provided")},
    { key: "13", label: "Spanish skills:", format: (value) => (value ? `${value}/10` : "Not provided")},
    { key: "14", label: "Health issues:" },
    { key: "15", label: "Criminal record:" },
  ];

  // Custom component to display each detail row
  const ProfileDetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Profile</Text>

      {Object.keys(quizData).length > 0 ? (
        <>
        <View style={styles.detailsContainer}>
          {/*
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
          */}
          {detailsMapping.map((detail) => {
            const rawValue = quizData[detail.key];
            const value = detail.format
              ? detail.format(rawValue)
              : rawValue || "Not provided";
            return (
              <ProfileDetailRow key={detail.key} label={detail.label} value={value} />
            );
          })}
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
    padding: height * 0.03,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: height * 0.03,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: Math.max(20, Math.min(width * 0.07, 28)),
    fontWeight: '700',
    marginVertical: height * 0.025,
    textAlign: 'center', 
    width: '100%',
    color: colors.primaryBlack
  },
  detailsContainer: {
    width: '100%',
    marginVertical: height * 0.03,
    borderWidth: 1,
    borderColor: colors.greyBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: height * 0.03,
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
    fontSize: height*0.02,
    fontWeight: '600',
    color: colors.primaryBlack,
  },
  detailValue: {
    flex: 1,
    fontSize: height*0.02,
    color: colors.primaryBlack,
    textAlign: 'right',
  },
  warningContainer: {
    marginVertical: height * 0.03,
    padding: height * 0.03,
    backgroundColor: '#ffcccb',
    borderRadius: 5,
    alignSelf: 'stretch',
  },
  warningText: {
    fontSize: Math.max(16, Math.min(width * 0.045, 22)),
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
});