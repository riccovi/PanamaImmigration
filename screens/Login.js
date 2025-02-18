import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView, TextInput, Switch, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

function LogIn({navigation}){
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(null) // 'signup' or 'login' or 'null'
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);


  // Function to validate email
  const isValidEmail = (email) => {
    // Valid email format: testing@gmail.com
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g; // https://regexr.com/3e48o
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    // Password must contain at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm // https://regexr.com/3bfsi
    return passwordRegex.test(password);
  };

  const getUsername = (email) => {
    return email.split("@")[0]; // Username is set as part of email before @ sign
  };

  // Handle signUp button press
  const handleSignUp = async () => {
    if (!email){ // If empty email
        Alert.alert("Missing", "Please enter an email address.");
        return;
    } 
    if (!isValidEmail(email)){ // Else, if invalid email
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
    }
    if (!password){ // Else, if empty password 
        Alert.alert("Missing Password", "Please enter a password");
        return;
    }
    if (!isValidPassword(password)){ // Else, if invalid password
        Alert.alert("Invalid Password", "Please enter a valid password.")
        return;
    }

    // If all valid, save to json file
    const username = getUsername(email);
    const newUser = { email, password, username, newsletter};
    try{
        await AsyncStorage.setItem(email, JSON.stringify(newUser));
        Alert.alert("Success", "Thanks for signing up! Please login.")
        setModalVisible(null);
    } catch (error){
        Alert.alert("Error", "Failed to create an account.");
    }
  };

  // Handle login button press
  const handleLogin = async () => {
    try{
        const storedUser = await AsyncStorage.getItem(email);
        if (!storedUser){ // If invalid email
            Alert.alert("Error", "Incorrect email.");
            return;
        }
        const { password: storedPassword, username } = JSON.parse(storedUser); // Check if given email matches stored password
        if (password !== storedPassword){ // If invalid password
            Alert.alert("Error", "Incorrect password.");
            return;
        }
        // If all valid, proceed to homescreen
        navigation.navigate("HomeScreen", {username});
        setModalVisible(null);
    } catch (error){
        Alert.alert("Error", "Login failed.");
    }
  }

  return (
    <View style={styles.container}>
    <ImageBackground source={require('../assets/picsum2.jpg')} resizeMode="cover" style={styles.image} >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeView}>

              <View style={styles.loginTop}>
                <Text style={styles.loginTextTop}>Panama Immigration Made Simple! ✈️</Text>
              </View>

              <View style={styles.loginMiddle}>
                <Text style={styles.loginTextMiddle}>We strive to provide an easy and stress-free way to immigrate to Panama.{"\n"}{"\n"}What are you waiting for? Let your new life start today! {"\n"}{"\n"}Log in or create an account for full access. Free of charge!</Text>
              </View>

              <TouchableOpacity style={styles.loginButtonSignup} onPress={() => setModalVisible("signup")}>
                <Text style={styles.loginTextSignup}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginButtonSignup} onPress={() => setModalVisible("login")}>
                <Text style={styles.loginTextSignup}>Log in</Text>
              </TouchableOpacity>

              {/* Signup Modal*/}
              <Modal visible={modalVisible === "signup"} animationType="slide" transparent={true}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalView}>
                    <Text style={styles.modalTitle}>Sign Up</Text>
                    <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' />
                    <Text>Passwords must contain at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number</Text>
                    <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
                    
                    <View style={styles.switchContainer}>
                        <Switch value={newsletter} onValueChange={setNewsletter} ios_backgroundColor="#3e3e3e" size="large" />
                        <Text>Sign up to hear all the latest news!</Text>
                    </View>

                    <TouchableOpacity style={styles.modalButton} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(null)}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
                </TouchableWithoutFeedback>
              </Modal>

              {/* Login Modal*/}
              <Modal visible={modalVisible === "login"} animationType="slide" transparent={true}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalView}>
                    <Text style={styles.modalTitle}>Log In</Text>
                    <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' />
                    <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />

                    <TouchableOpacity style={styles.modalButton} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(null)}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
                </TouchableWithoutFeedback>
              </Modal>   
 
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  </View>
  )
}

export default LogIn;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    image: {
      flex: 1,
      justifyContent: "center",
      width: '100%',
      height: '100%',
    },
    safeView: {
      flex: 1
    },
  
    loginTop: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingLeft:"10%",
      paddingRight:"10%"
    },
    loginTextTop: {
      fontSize: 33,
      fontWeight:"bold"
    },
  
    loginMiddle: {
      paddingTop: 10,
      paddingLeft:"9%",
      paddingRight:"9%"
    },
    loginTextMiddle: {
      fontSize: 17
    },

    loginButtonSignup: {
      width: "90%",
      height: 60,
      borderRadius: 35,
      marginLeft:"5%",
      marginBottom: 10,
      backgroundColor: "black",
      alignContent:"center",
      justifyContent:"center"
    },
    loginTextSignup: {
      textAlign:"center",
      color:"white",
      fontWeight:"bold",
      fontSize:28
    },

    modalContainer: {
        flex: 1, 
        justifyContent: "center", 
        backgroundColor: "rgba(0,0,0,0.5)" // black with alpha
    },
    modalView: {
        backgroundColor: "white",
        padding: 20,
        marginHorizontal: 40,
        borderRadius: 10
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15
    },
    input: {
        borderWidth: 1, 
        padding: 10, 
        marginVertical: 10, 
        borderRadius: 5
    },
    switchContainer: {
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: 15
    },
    modalButton: {
        backgroundColor: "black", 
        padding: 10, 
        marginTop: 10, 
        borderRadius: 5, 
        alignItems: "center"
    },
    buttonText: {
        color: "white",
        fontSize: 18
    },
    closeButton: {
        marginTop: 10, 
        alignItems: "center"
    },
  });