import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Cell, Section, TableView } from 'react-native-tableview-simple'
import BottomBar from '../components/BottomBar';

const { width } = Dimensions.get('window') //Get width of device - responsive design

// Custom component to display cells on homescreen
const HomeScreenCell = ({title, imgUri, action}) => {
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
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TableView>
          <Section header="" hideSeparator="true" separatorTintColor="#ccc">
            <Text style={styles.welcome}>Welcome, {userDetails?.username || "Guest"}!</Text>
            <HomeScreenCell title="Why Panama" imgUri={require('../assets/panama-flag.jpg')} action={() => navigation.navigate("WhyPanama")} />
            <HomeScreenCell title="Eligibility Quiz" imgUri={require('../assets/quiz-pic.jpg')} action={() => navigation.navigate("EligibilityQuiz")} />
            <HomeScreenCell title="Criminal Check" imgUri={require('../assets/camera-pic.jpg')} action={() => navigation.navigate("CriminalCheck")} />
            <HomeScreenCell title="Profile" imgUri={require('../assets/profile-pic.jpg')} action={() => navigation.navigate("Profile")} />
            <HomeScreenCell title="Settings" imgUri={require('../assets/settings-pic.jpg')} action={() => navigation.navigate("Settings")} /> 
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
    justifyContent: 'center'
  },
  welcome: {
    paddingVertical: 25,
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  cellView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: width / 3.5,
    width: width / 1.1,
    marginVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#4a90e2', 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6 
  },
  cellImage: {
    height: '90%', 
    width: '35%',
    borderRadius: 15, 
    marginRight: 15
  },
  cellText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 1 
  },
  bottomCell: {
    marginBottom: 60
  }
});

/*
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    safeArea: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff'
    },
    welcome: {
      padding: 30,
      fontSize: 25,
      fontWeight: 'bold',
      alignSelf: 'center'
    },

    cellView: {
      flexDirection: 'row',
      alignItems: 'center',
      height: width/3,
      width: width/1.1,
      marginVertical: 15,
      backgroundColor: '#accbfc',
      borderRadius: 50
    },
    cellImage: {
      height: '100%', 
      width: '40%',
      borderRadius: 50,
      marginRight: '10%'
    },
    cellText: {
      fontSize: 20,
      fontWeight: 'bold'
    }
  });
  */