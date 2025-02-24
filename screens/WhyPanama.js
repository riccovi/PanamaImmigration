import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import BottomBar from '../components/BottomBar';

function WhyPanama({}){
  const [errorMsg, setErrorMsg] = useState(null);
  const [userWeatherData, setUserWeatherData] = useState(null);
  const [panamaWeatherData, setPanamaWeatherData] = useState(null);

  useEffect(() => {
    (async () => {
      // Fetch Panama weather. Panama City coordinates - 8.9824° N, 79.5199° W
      try {
        const panamaResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=8.9824&lon=-79.5199&appid=d2db070e561c26a48c6d8013380bd596&units=metric`
        );
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
        const userResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.coords.latitude}&lon=${userLocation.coords.longitude}&appid=d2db070e561c26a48c6d8013380bd596&units=metric`
        );
        const userJson = await userResponse.json();
        setUserWeatherData(userJson);
      } catch (error) {
        setErrorMsg("Error fetching your weather data");
        console.log(error);
      }
    })();
  }, []);

  // Calculate current Panama time
  const panamaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Panama" }));
  const panamaHour = panamaTime.getHours();
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
  } else if (diffInHours < 1) {
    timeDiffText = `You are ${Math.abs(diffInHours)} hours ahead of Panama time.`; // hours (plural)
  } else if (diffInHours == 1) {
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

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* User's Weather Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>{userWeatherData ? `Current weather in ${userWeatherData.name}` : "Your current weather"}</Text>
          {errorMsg ? (
            <>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <Text style={styles.instructions}>To change your location permissions, open your device's Settings, find this app, and enable Location.</Text>
            </>
          ) : userWeatherData ? (
            <>
              <Text style={styles.weatherText}>{userWeatherData.weather[0].description}</Text>
              <Text style={styles.weatherText}>Temp: {userWeatherData.main.temp}°C (Min: {userWeatherData.main.temp_min}°C, Max: {userWeatherData.main.temp_max}°C)</Text>
              <Text style={styles.weatherText}>Precipitation: {getPrecipitation(userWeatherData)}</Text>
              <Text style={styles.weatherText}>Humidity: {userWeatherData.main.humidity}%</Text>
              <Text style={styles.weatherText}>Wind Speed: {userWeatherData.wind.speed} m/s</Text>
              <Image style={styles.weatherIcon} source={{uri:`http://openweathermap.org/img/wn/${userWeatherData.weather[0].icon}@2x.png`}}/>
            </>
          ) : (
            <Text>Loading your weather data...</Text>
          )}
        </View>

        {/* Panama Weather Section */}
        <View style={styles.section}>
          <Text style={styles.headerText}>{panamaWeatherData ? `Current weather in ${panamaWeatherData.name}` : "Current weather in Panama City"}</Text>
          {panamaWeatherData ? (
            <>
              <Text style={styles.weatherText}>{panamaWeatherData.weather[0].description}</Text>
              <Text style={styles.weatherText}> Temp: {panamaWeatherData.main.temp}°C (Min: {panamaWeatherData.main.temp_min}°C, Max: {panamaWeatherData.main.temp_max}°C)</Text>
              <Text style={styles.weatherText}>Precipitation: {getPrecipitation(panamaWeatherData)}</Text>
              <Text style={styles.weatherText}>Humidity: {panamaWeatherData.main.humidity}%</Text>
              <Text style={styles.weatherText}>Wind Speed: {panamaWeatherData.wind.speed} m/s</Text>
              <Image style={styles.weatherIcon} source={{ uri: `http://openweathermap.org/img/wn/${panamaWeatherData.weather[0].icon}@2x.png`}}/>
            </>
          ) : (
            <Text>Loading Panama weather data...</Text>
          )}
          <Text style={styles.weatherText}>Current time: {panamaTime.toLocaleTimeString()}</Text>
          <Text style={styles.timeDiffText}>{timeDiffText}</Text>
          <Image style={styles.panamaImage} source={isDaytime ? require('../assets/panama_day.jpg') : require('../assets/panama_night.jpg')}/>
        </View>

        {/* Panama Explanation */}
        <View style={styles.section}>
          <Text style={styles.dummyText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur, nisl sit amet ultricies malesuada, sapien dolor faucibus libero, vel dapibus libero magna vel lectus. Curabitur a eros eu magna dictum interdum. Praesent nec feugiat nunc. Etiam id est vitae purus cursus aliquet. Suspendisse potenti. Cras dictum, libero in tincidunt porttitor, augue ligula dictum justo, ac vulputate justo turpis eget purus.</Text>
        </View>

        <BottomBar />
      </ScrollView>
    )
}

export default WhyPanama;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
  weatherText: {
    fontSize: 16,
    marginVertical: 4,
    textAlign: 'center',
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  timeDiffText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  panamaImage: {
    width: 300,
    height: 200,
    marginTop: 10,
    resizeMode: 'cover',
  },
  dummyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
  },
});