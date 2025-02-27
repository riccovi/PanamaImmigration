import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';
import { colors } from '../components/colors';

const { width } = Dimensions.get('window');

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

  return (
    <View style={styles.container}>
      {/* If image doesn't exist, display buttons in column*/}
      {!selectedImage && (
        <>
          <Text style={styles.infoText}>To do a criminal check, we will need a photo of your face to scan through our database. Either select an image from the gallery or take a photo.</Text>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick an image from gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take a photo</Text>
          </TouchableOpacity>
        </>
      )}
      {/* If image exists, display: header, image, row of buttons, info text*/}
      {selectedImage && (
        <>
          <Text style={styles.headerText}>Looking good!</Text>
          <Image source={{ uri: selectedImage.localUri }} style={styles.image} />
          <View style={styles.rowContainer}>
            <TouchableOpacity style={styles.buttonRow} onPress={pickImage}>
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonRow} onPress={takePhoto}>
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonRow, styles.deleteButton]}onPress={deletePhoto}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
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
    padding: width * 0.05,
    backgroundColor: colors.primaryWhite
  },
  button: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: 5,
    marginVertical: width * 0.03,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primaryWhite,
    fontSize: width * 0.05,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    borderRadius: 10,
    marginVertical: width * 0.05,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: width * 0.03,
    marginVertical: width * 0.03,
  },
  buttonRow: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.03,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: width * 0.01,
    alignItems: 'center',
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
    fontSize: width * 0.055,
    textAlign: 'center',
    marginVertical: width * 0.03,
    color: colors.primaryBlack
  }, 
});