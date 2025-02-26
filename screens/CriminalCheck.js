import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from '../components/BottomBar';

function CriminalCheck() {
  const [selectedImage, setSelectedImage] = useState(null);

  // If there is, load any previously saved image from AsyncStorage
  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem('selectedImage');
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
      await AsyncStorage.setItem('selectedImage', JSON.stringify(image));
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
    await AsyncStorage.removeItem('selectedImage');
  };

  return (
    <View style={styles.container}>
      {/* If image doesn't exist, display buttons in column*/}
      {!selectedImage && (
        <>
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
    <BottomBar />
    </View>
  );
}

export default CriminalCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    marginVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  buttonRow: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  }, 
});