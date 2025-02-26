import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import { useState, useEffect } from 'react';
import { DateTime } from "luxon";
import { AntDesign } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import prosAndConsData from '../data/prosAndCons.json'; 
import BottomBar from '../components/BottomBar';

function WhyPanama({}){
  const [errorMsg, setErrorMsg] = useState(null);
  const [userWeatherData, setUserWeatherData] = useState(null);
  const [panamaWeatherData, setPanamaWeatherData] = useState(null);
  const [prosConsIndex, setProsConsIndex] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);

  useEffect(() => {
    (async () => {
      // Fetch Panama weather. Panama City coordinates - 8.9824° N, 79.5199° W
      try {
        const panamaResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=8.9824&lon=-79.5199&appid=d2db070e561c26a48c6d8013380bd596&units=metric`);
        const panamaJson = await panamaResponse.json();
        setPanamaWeatherData(panamaJson);
      } catch (error) {
        console.log("Error fetching Panama weather", error);
      }

      // Request location permission for user's weather
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission denied: Please go to your device's Settings, find this app, and enable location permissions.");
        return;
      }

      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        const userResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.coords.latitude}&lon=${userLocation.coords.longitude}&appid=d2db070e561c26a48c6d8013380bd596&units=metric`);
        const userJson = await userResponse.json();
        setUserWeatherData(userJson);
      } catch (error) {
        setErrorMsg("Error fetching your weather data");
        console.log(error);
      }
    })();
  }, []);

  // Calculate current Panama time
  const panamaTime = DateTime.now().setZone("America/Panama");
  const panamaHour = panamaTime.hour;
  // Check if Panama is day time (between 6am and 6pm)
  const isDaytime = panamaHour >= 6 && panamaHour < 18; 

  // Calculate difference between user and Panama time
  const panamaOffset = 300; // 300 minutes behind UTC
  const userOffset = new Date().getTimezoneOffset(); // minutes from UTC
  const diffInMinutes = userOffset - panamaOffset;
  const diffInHours = diffInMinutes / 60;
  let timeDiffText = "";
  if (diffInHours > 1) {
    timeDiffText = `You are ${diffInHours} hours behind Panama time.`; // hours (plural)
  } else if (diffInHours == 1) {
    timeDiffText = `You are 1 hour behind Panama time.`; // hour (singular)
  } else if (diffInHours < -1) {
    timeDiffText = `You are ${Math.abs(diffInHours)} hours ahead of Panama time.`; // hours (plural)
  } else if (diffInHours == -1) {
    timeDiffText = `You are 1 hour ahead of Panama time.`; // hour (singular)
  } else {
    timeDiffText = "Your time is the same as Panama time.";
  }

  // Helper function extracting precipitation info
  const getPrecipitation = (data) => {
    if (data.rain && data.rain["1h"]) {
      return `${data.rain["1h"]} mm`;
    } else if (data.snow && data.snow["1h"]) {
      return `${data.snow["1h"]} mm`;
    } else {
      return "0 mm";
    }
  };

  // Pros and cons table
  const pros = prosAndConsData.find((item) => item.type === "Pros")?.content || [];
  const cons = prosAndConsData.find((item) => item.type === "Cons")?.content || []; 
  const handleNext = () => {
    if (prosConsIndex < pros.length - 1) setProsConsIndex(prosConsIndex + 1);
  };
  const handlePrev = () => {
    if (prosConsIndex > 0) setProsConsIndex(prosConsIndex - 1);
  };

  // Accelerometer subscription for shake detection
  useEffect(() => {
    const shakeThreshold = 1.7; // Adjust this threshold based on testing
    const subscription = Accelerometer.addListener(accData => {
      const { x, y, z } = accData;
      const totalAcc = Math.sqrt(x * x + y * y + z * z);
      if (totalAcc > shakeThreshold) {
        const now = Date.now();
        // Debounce: Only trigger if at least 1 second has passed since last shake
        if (now - lastShakeTime > 1000) {
          setLastShakeTime(now);
          handleNext();
        }
      }
    });
    return () => subscription && subscription.remove();
  }, [lastShakeTime, prosConsIndex]);

  // Bold pro/con header content
  const renderProConText = (text) => {
    // Split the text at the first colon to separate the heading
    const [heading, ...rest] = text.split(':');
    return (
      <Text>
        <Text style={{ fontWeight: 'bold' }}>{heading}:</Text>
        <Text>{rest.join(':')}</Text>
      </Text>
    );
  };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* User's Weather Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>{userWeatherData ? `${userWeatherData.name}` : "Your current weather"}</Text>
          {errorMsg ? (
            <>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <Text style={styles.instructions}>To change your location permissions, open your device's Settings, find this app, and enable Location.</Text>
            </>
          ) : userWeatherData ? (
            <>
            <View style={styles.weatherContainer}>
              <Image style={styles.weatherIcon} source={{uri:`http://openweathermap.org/img/wn/${userWeatherData.weather[0].icon}@2x.png`}}/>
              <View style={styles.weatherDetails}>
              <Text style={styles.weatherHead}>{userWeatherData.weather[0].description.toUpperCase()}</Text>
                <Text style={styles.weatherText}>Temp: {userWeatherData.main.temp}°C</Text>
                <Text style={styles.weatherText}>Precipitation: {getPrecipitation(userWeatherData)}</Text>
                <Text style={styles.weatherText}>Humidity: {userWeatherData.main.humidity}%</Text>
                <Text style={styles.weatherText}>Wind Speed: {userWeatherData.wind.speed} m/s</Text>
              </View>
            </View>
            </>
          ) : (
            <Text>Loading your weather data...</Text>
          )}
        </View>
        
        {/* Panama Weather Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Panama City</Text>
          {panamaWeatherData ? (
            <>
              <View style={styles.weatherContainer}>
                <Image style={styles.weatherIcon} source={{ uri: `http://openweathermap.org/img/wn/${panamaWeatherData.weather[0].icon}@2x.png`}}/>
                <View style={styles.weatherDetails}>
                <Text style={styles.weatherHead}>{panamaWeatherData.weather[0].description.toUpperCase()}</Text>
                  <Text style={styles.weatherText}>Temp: {panamaWeatherData.main.temp}°C</Text>
                  <Text style={styles.weatherText}>Precipitation: {getPrecipitation(panamaWeatherData)}</Text>
                  <Text style={styles.weatherText}>Humidity: {panamaWeatherData.main.humidity}%</Text>
                  <Text style={styles.weatherText}>Wind Speed: {panamaWeatherData.wind.speed} m/s</Text>
                </View>
              </View>
            </>
          ) : (
            <Text>Loading Panama weather data...</Text>
          )}
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>Panama Time: {panamaTime.toFormat("hh:mm a")}</Text>
          <Image style={styles.panamaImage} source={isDaytime ? require('../assets/panama_day.jpg') : require('../assets/panama_night.jpg')}/>
          <Text style={styles.weatherText}>{timeDiffText}</Text>
        </View>

        {/* Pros and Cons */}
        <View style={styles.prosContainer}>
          <Text style={styles.prosHeader}>Pros & Cons of Panama</Text>
          {/* Pro */}
          <View style={[styles.prosCard, {backgroundColor: 'lightgreen'}]}>
            <Text style={styles.prosCardTitle}>Pro</Text>
            <Text style={styles.prosCardContent}>{renderProConText(pros[prosConsIndex])}</Text>
          </View>
          {/* Con */}
          <View style={[styles.prosCard, {backgroundColor: 'pink'}]}>
            <Text style={styles.prosCardTitle}>Con</Text>
            <Text style={styles.prosCardContent}>{renderProConText(cons[prosConsIndex])}</Text>
          </View>
          {/* Navigation Arrows */}
          <View style={styles.prosNavContainer}>
            <TouchableOpacity onPress={handlePrev} disabled={prosConsIndex === 0}>
              <AntDesign name="leftcircleo" size={32} color={prosConsIndex === 0 ? "gray" : "black"} />
            </TouchableOpacity>
            <Text style={styles.prosIndexText}>{prosConsIndex + 1} / {pros.length}</Text>
            <TouchableOpacity onPress={handleNext} disabled={prosConsIndex === pros.length - 1}>
              <AntDesign name="rightcircleo" size={32} color={prosConsIndex === pros.length - 1 ? "gray" : "black"} />
            </TouchableOpacity>
          </View>
          <View style={styles.shakeHintContainer}>
            <Text style={styles.shakeHintText}>Shake for next!</Text>
          </View>
        </View>

        <BottomBar />
      </ScrollView>
    )
}

export default WhyPanama;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
  },

  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightblue', 
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  weatherDetails: {
    flex: 1,
  },
  weatherHead: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  weatherText: {
    fontSize: 16,
    marginVertical: 4,
    textAlign: 'center',
    fontWeight: 'bold'
  },

  panamaImage: {
    width: 300,
    height: 200,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'black',
  },

  prosContainer: { 
    padding: 20, 
    alignItems: "center",
    paddingBottom: 80, 
    position: 'relative'
  },
  prosHeader: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  prosCard: { 
    width: "90%", 
    padding: 15, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderRadius: 10, 
    alignItems: 'center'
  },
  prosCardTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
  },
  prosCardContent: { 
    fontSize: 16, 
    marginTop: 5,
  },
  prosNavContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 20 
  },
  prosIndexText: {
    fontSize: 18, 
    marginHorizontal: 20 
  },

  shakeHintContainer: {
    position: 'absolute',
    top: '20%',
    right: '85%',
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  shakeHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});