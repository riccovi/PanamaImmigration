import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { Cell, Section, TableView } from 'react-native-tableview-simple'

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

function HomeScreen({route}){
  return (
    <SafeAreaView>
      <ScrollView>
        <TableView>
          <Section header="" hideSeparator="true" separatorTintColor="#ccc">
            <Text style={styles.welcome}>Welcome, username!</Text> {/* {route.params.username} */}
            <HomeScreenCell title="Why Panama" imgUri={require('../assets/panama-flag.jpg')} action={() => navigation.navigate("WhyPanama")} />
            <HomeScreenCell title="Eligibility Quiz" imgUri={require('../assets/quiz-pic.jpg')} action={() => navigation.navigate("EligibilityQuiz")} />
            <HomeScreenCell title="Criminal Check" imgUri={require('../assets/camera-pic.jpg')} action={() => navigation.navigate("CriminalCheck")} />
          </Section>
        </TableView>
      </ScrollView>
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
      padding: 30,
      fontSize: 30,
      fontWeight: 'bold'
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