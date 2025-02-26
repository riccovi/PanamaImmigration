import React, { useState } from 'react';
import { View, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import BottomBar from '../components/BottomBar';

function CriminalCheck() {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!pickerResult.canceled) {
      setSelectedImage({ localUri: pickerResult.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    let cameraResult = await ImagePicker.launchCameraAsync();

    if (!cameraResult.canceled) {
      setSelectedImage({ localUri: cameraResult.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Pick an image from gallery" onPress={pickImage} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Take a photo" onPress={takePhoto} />
      </View>
      {selectedImage && (
        <>
          <Image source={{ uri: selectedImage.localUri }} style={styles.image} />
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
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
  image: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    marginVertical: 20,
  }
});

/*
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import BottomBar from '../components/BottomBar';

function CriminalCheck({}){
  const [hasCamPerms, setCamPerms] = useState(null); // null = waiting, true/false = granted/denied
  const [mode, setMode] = useState('options'); // 'options', 'camera', or 'preview'
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCamPerms(status === 'granted');
    })();
  }, []);

  // Open gallery and let the user pick an image
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      setMode('preview');
    }
  };

  // Take a photo using the Camera component
  const takePhoto = async () => {
    if (cameraRef.current) {
      let capturedPhoto = await cameraRef.current.takePictureAsync();
      setPhoto(capturedPhoto.uri);
      setMode('preview');
    }
  };
  // Handle waiting on camera permission
  if (hasCamPerms === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting Camera Permissions...</Text>
      </View>
    );
  }
  // If permission is denied, show a message
  if (hasCamPerms === false) {
    return (
      <View style={styles.container}>
        <Text>Access to camera denied. Please go to Settings to change it.</Text>
      </View>
    );
  }

  // Render based on the current mode
  if (mode === 'options') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Criminal Check - Submit Your Photo</Text>
        <TouchableOpacity style={styles.button} onPress={() => setMode('camera')}>
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openGallery}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (mode === 'camera') {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={() => {setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);}}>
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setMode('options')}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  } else if (mode === 'preview') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Preview</Text>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.previewImage} />
        ) : (
          <Text>No photo available</Text>
        )}
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.button} onPress={() => setMode('options')}>
            <Text style={styles.buttonText}>Retake / Choose Another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {console.log('Photo confirmed:', photo);}}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //<BottomBar /> 
  return null; 
}

export default CriminalCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 25,
    margin: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  flipButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  captureButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.5)',
    borderRadius: 5,
  },
  previewImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
*/