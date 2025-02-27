import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Cell, Section, TableView } from 'react-native-tableview-simple'
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width } = Dimensions.get('window');

// Custom component to display cells on homescreen
const HomeScreenCell = ({ title, imgUri, action }) => {
  return (
    <Cell cellContentView={
      <TouchableOpacity onPress={action}>
        <View style={styles.cellView}>
          <Image source={imgUri} style={styles.cellImage} />
          <Text style={styles.cellText}>{title}</Text>
        </View>
      </TouchableOpacity>
    }/>
  )
}

function HomeScreen({ route, navigation }){
  const { userDetails } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TableView>
          <Section header="" hideSeparator="true" separatorTintColor="#ccc">
            <Text style={styles.welcome}>Welcome, {userDetails?.username || "Guest"}!</Text>
            <HomeScreenCell title="Why Panama" imgUri={require('../assets/panama-flag.jpg')} action={() => navigation.navigate("WhyPanama", { userDetails })} />
            <HomeScreenCell title="Eligibility Quiz" imgUri={require('../assets/quiz-pic.jpg')} action={() => navigation.navigate("EligibilityQuiz", { userDetails })} />
            <HomeScreenCell title="Criminal Check" imgUri={require('../assets/camera-pic.jpg')} action={() => navigation.navigate("CriminalCheck", { userDetails })} />
            <HomeScreenCell title="Profile" imgUri={require('../assets/profile-pic.jpg')} action={() => navigation.navigate("Profile", { userDetails })} />
            <HomeScreenCell title="Settings" imgUri={require('../assets/settings-pic.jpg')} action={() => navigation.navigate('Settings', { userDetails })} /> 
         </Section>
        </TableView>
      </ScrollView>
      <BottomBar userDetails={userDetails}/>
    </SafeAreaView>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryWhite
  },
  welcome: {
    paddingVertical: width * 0.06,
    fontSize: width * 0.08,
    fontWeight: 'bold',
    alignSelf: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    color: colors.primaryBlack
  },
  cellView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: width * 0.3,
    width: width * 0.9,
    marginVertical: width * 0.025,
    paddingHorizontal: width * 0.04,
    backgroundColor: colors.secondaryBlue, 
    borderRadius: 20,
    shadowColor: colors.primaryBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6 
  },
  cellImage: {
    height: '90%', 
    width: '35%',
    borderRadius: 15, 
    marginRight: width * 0.06
  },
  cellText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: colors.primaryWhite,
    flexShrink: 1 
  },
  bottomCell: {
    marginBottom: width * 0.15
  }
});
