import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import { useState, useEffect } from 'react';
import { DateTime } from "luxon";
import { AntDesign } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import prosAndConsData from '../data/prosAndCons.json'; 
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width, height } = Dimensions.get('window');

function WhyPanama({ route }){
  const { userDetails } = route.params || {};
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
  if (diffInHours > 1) { timeDiffText = `You are ${diffInHours} hours behind Panama time.`; } // hours (plural)
  else if (diffInHours == 1) { timeDiffText = `You are 1 hour behind Panama time.`; } // hour (singular)
  else if (diffInHours < -1) { timeDiffText = `You are ${Math.abs(diffInHours)} hours ahead of Panama time.`; } // hours (plural)
  else if (diffInHours == -1) { timeDiffText = `You are 1 hour ahead of Panama time.`; } // hour (singular)
  else { timeDiffText = "Your time is the same as Panama time."; }
  
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

  // Custom component displaying weather details in a card format
  const WeatherCard = ({ weatherData }) => {
    const getPrecipitation = (data) => {
      if (data.rain && data.rain["1h"]) return `${data.rain["1h"]} mm`;
      else if (data.snow && data.snow["1h"]) return `${data.snow["1h"]} mm`;
      else return "0 mm";
    };
    return (
      <View style={styles.weatherContainer}>
        <Image style={styles.weatherIcon} source={{ uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png` }}/>
        <View style={styles.weatherDetails}>
          <Text style={styles.weatherHead}>{weatherData.weather[0].description.toUpperCase()}</Text>
          <Text style={styles.weatherText}>Temp: {weatherData.main.temp}°C</Text>
          <Text style={styles.weatherText}>Precipitation: {getPrecipitation(weatherData)}</Text>
          <Text style={styles.weatherText}>Humidity: {weatherData.main.humidity}%</Text>
          <Text style={styles.weatherText}>Wind Speed: {weatherData.wind.speed} m/s</Text>
        </View>
      </View>
    );
  };

  // General weather section component with header, error handling, or loading state
  const WeatherSection = ({ header, errorMsg, weatherData, loadingMessage }) => (
    <View style={styles.section}>
      <Text style={styles.headerText}>{header}</Text>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : weatherData ? (
        <WeatherCard weatherData={weatherData} />
      ) : (
        <Text>{loadingMessage}</Text>
      )}
    </View>
  );

  // Time section showing Panama time, an image, and time difference text
  const TimeSection = ({ panamaTime, isDaytime, timeDiffText }) => (
    <View style={styles.section}>
      <Text style={styles.headerText}>Panama Time: {panamaTime.toFormat("hh:mm a")}</Text>
      <Image style={styles.panamaImage} source={isDaytime ? require("../assets/panama_day.jpg") : require("../assets/panama_night.jpg")}/>
      <Text style={styles.weatherText}>{timeDiffText}</Text>
    </View>
  );

  // Component to render bolded pro/con header in text
  const RenderProConText = ({text}) => {
    // Split the text at the first colon to separate the heading
    const [heading, ...rest] = text.split(':');
    return (
      <Text>
        <Text style={{ fontWeight: 'bold' }}>{heading}:</Text>
        <Text>{rest.join(':')}</Text>
      </Text>
    );
  };
  
  // Card component for a pro/con item
  const ProConCard = ({ type, content }) => {
    const backgroundColor = type === "Pro" ? "lightgreen" : "pink";
    return (
      <View style={[styles.prosCard, { backgroundColor }]}>
        <Text style={styles.prosCardTitle}>{type}</Text>
        <Text style={styles.prosCardContent}><RenderProConText text={content}/></Text>
      </View>
    );
  };

  // Section component for pros and cons with navigation arrows
  const ProsConsSection = ({ pros, cons, index, onNext, onPrev }) => (
    <View style={styles.prosContainer}>
      <Text style={styles.prosHeader}>Pros & Cons of Panama</Text>
      <ProConCard type="Pro" content={pros[index]} />
      <ProConCard type="Con" content={cons[index]} />
      <View style={styles.prosNavContainer}>
        <TouchableOpacity onPress={onPrev} disabled={index === 0}>
          <AntDesign name="leftcircleo" size={32} color={index === 0 ? "gray" : "black"} />
        </TouchableOpacity>
        <Text style={styles.prosIndexText}>
          {index + 1} / {pros.length}
        </Text>
        <TouchableOpacity onPress={onNext} disabled={index === pros.length - 1}>
          <AntDesign name="rightcircleo" size={32} color={index === pros.length - 1 ? "gray" : "black"} />
        </TouchableOpacity>
      </View>
      <View style={styles.shakeHintContainer}>
        <Text style={styles.shakeHintText}>Shake for next!</Text>
      </View>
    </View>
  );
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Weather Section */}
      <WeatherSection
        header={userWeatherData ? userWeatherData.name : "Your current weather"}
        errorMsg={errorMsg}
        weatherData={userWeatherData}
        loadingMessage="Loading your weather data..."
      />
      {/* Panama Weather Section */}
      <WeatherSection
        header="Panama City"
        weatherData={panamaWeatherData}
        loadingMessage="Loading Panama weather data..."
      />
      {/* Time Section */}
      <TimeSection panamaTime={panamaTime} isDaytime={isDaytime} timeDiffText={timeDiffText} />
      {/* Pros & Cons Section */}
      <ProsConsSection pros={pros} cons={cons} index={prosConsIndex} onNext={handleNext} onPrev={handlePrev} />
        <BottomBar userDetails={userDetails}/>
    </ScrollView>
  )
}

export default WhyPanama;

const styles = StyleSheet.create({
  container: {
    paddingTop: height * 0.07,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.04,
    backgroundColor: colors.primaryWhite,
  },
  section: {
    marginBottom: height * 0.04,
    alignItems: 'center',
  },
  headerText: {
    fontSize: Math.max(18, Math.min(width * 0.06, 24)),
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },

  errorText: {
    fontSize: Math.max(14, Math.min(width * 0.045, 20)),
    color: 'red',
    textAlign: 'center',
  },

  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBlue, 
    padding: height * 0.02,
    borderRadius: 10,
    width: '100%',
  },
  weatherIcon: {
    width: width * 0.25,
    height: width * 0.25,
  },
  weatherDetails: {
    flex: 1,
  },
  weatherHead: {
    fontSize: width * 0.055,
    marginVertical: width * 0.02,
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.primaryBlack
  },
  weatherText: {
    fontSize: Math.max(14, Math.min(width * 0.045, 20)),
    marginVertical: height * 0.01,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.primaryBlack
  },

  panamaImage: {
    width: '90%',
    height: height * 0.3,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.greyBorder,
    minHeight: 150,
    maxHeight: 300,
  },

  prosContainer: { 
    padding: width * 0.05, 
    alignItems: "center",
    paddingBottom: height * 0.12, 
    position: 'relative'
  },
  prosHeader: { 
    fontSize: Math.max(16, Math.min(width * 0.06, 24)), 
    fontWeight: "bold", 
    marginBottom: width * 0.05, 
    color: colors.primaryBlack
  },
  prosCard: { 
    width: "90%", 
    padding: width * 0.04, 
    marginBottom: height * 0.01, 
    borderWidth: 2, 
    borderRadius: 10, 
    alignItems: 'center',
    borderColor: colors.greyBorder
  },
  prosCardTitle: { 
    fontSize: Math.max(16, Math.min(width * 0.05, 22)),
    fontWeight: "bold", 
    color: colors.primaryBlack
  },
  prosCardContent: { 
    fontSize: Math.max(14, Math.min(width * 0.045, 20)), 
    marginTop: width * 0.02,
  },
  prosNavContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: height * 0.02,
  },
  prosIndexText: {
    fontSize: Math.max(14, Math.min(width * 0.045, 20)), 
    marginHorizontal: width * 0.05 
  },

  shakeHintContainer: {
    position: 'absolute',
    top: '20%',
    right: '85%',
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: width * 0.015,
    paddingVertical: height * 0.005,
    borderRadius: 3,
  },
  shakeHintText: {
    color: '#fff',
    fontSize: width * 0.03,
    fontWeight: 'bold',
  }
});