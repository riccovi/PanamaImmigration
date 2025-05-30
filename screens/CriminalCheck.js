import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width, height } = Dimensions.get('window');

// Custom component to render a set of action buttons.
// It accepts an array of button configurations and an optional container style.
const PhotoActionButtons = ({ buttons, containerStyle }) => (
  <View style={containerStyle}>
    {buttons.map((btn, index) => (
      <TouchableOpacity key={index} style={btn.style} onPress={btn.onPress}>
        <Text style={styles.buttonText}>{btn.title}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

function CriminalCheck({ route }) {
  const { userDetails } = route.params || {};
  const [selectedImage, setSelectedImage] = useState(null);

  // If there is, load any previously saved image from AsyncStorage
  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem('criminal_check_photo');
        if (storedImage) {
          setSelectedImage(JSON.parse(storedImage));
        }
      } catch (error) {
        console.error('Failed to load image from storage', error);
      }
    };

    loadImage();
  }, []);

  // Save selected image in AsyncStorage
  const saveImage = async (image) => {
    try {
      await AsyncStorage.setItem('criminal_check_photo', JSON.stringify(image));
    } catch (error) {
      console.error('Failed to save image to storage', error);
    }
  };

  // Use device gallery
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!pickerResult.canceled) {
     const newImage = { localUri: pickerResult.assets[0].uri };
     setSelectedImage(newImage);
     await saveImage(newImage);
    }
  };

  // Use device camera
  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    let cameraResult = await ImagePicker.launchCameraAsync();

    if (!cameraResult.canceled) {
      const newImage = { localUri: cameraResult.assets[0].uri };
      setSelectedImage(newImage);
      await saveImage(newImage);
    }
  };

  // Delete photo
  const deletePhoto = async () => {
    setSelectedImage(null);
    await AsyncStorage.removeItem('criminal_check_photo');
  };

  // Button configurations for each state
  const noImageButtons = [
    { title: "Pick an image from gallery", onPress: pickImage, style: styles.button },
    { title: "Take a photo", onPress: takePhoto, style: styles.button }
  ];
  const imageButtons = [
    { title: "Gallery", onPress: pickImage, style: styles.buttonRow },
    { title: "Camera", onPress: takePhoto, style: styles.buttonRow },
    { title: "Delete", onPress: deletePhoto, style: [styles.buttonRow, styles.deleteButton] }
  ];

  return (
    <View style={styles.container}>
      {/* If image doesn't exist, display buttons in column*/}
      {!selectedImage && (
        <>
          <Text style={styles.infoText}>To do a criminal check, we will need a photo of your face to scan through our database. Either select an image from the gallery or take a photo.</Text>
          <PhotoActionButtons buttons={noImageButtons} />
        </>
      )}
      {/* If image exists, display: header, image, row of buttons, info text*/}
      {selectedImage && (
        <>
          <Text style={styles.headerText}>Looking good!</Text>
          <Image source={{ uri: selectedImage.localUri }} style={styles.image} />
          <PhotoActionButtons buttons={imageButtons} containerStyle={styles.rowContainer} />
          <Text style={styles.infoText}>Face not found in our database. Good news. You are not a criminal!</Text>
        </>
      )}
    <BottomBar userDetails={userDetails}/>
    </View>
  );
}

export default CriminalCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: height * 0.03,
    backgroundColor: colors.primaryWhite
  },
  button: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: 5,
    marginVertical: height * 0.015,
    minWidth: '80%',
    alignItems: 'center',
    minHeight: 45,
    maxHeight: 60,
  },
  buttonText: {
    color: colors.primaryWhite,
    fontSize: Math.max(10, Math.min(width * 0.04, 18)),
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    borderRadius: 10,
    marginVertical: height * 0.03,
    maxWidth: 500,
    maxHeight: 500,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: width * 0.03,
    marginVertical: height * 0.02,
  },
  buttonRow: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: width * 0.01,
    alignItems: 'center',
    minHeight: 40,
    maxHeight: 60,
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: colors.primaryBlack
  },
  infoText: {
    fontSize: Math.max(16, Math.min(width * 0.05, 22)),
    textAlign: 'center',
    marginVertical: height * 0.02,
    color: colors.primaryBlack,
    paddingBottom: width*0.1
  }, 
});