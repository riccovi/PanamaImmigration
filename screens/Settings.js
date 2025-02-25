import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Button, Alert, StyleSheet, Linking, Image } from 'react-native';
import { TableView, Section, Cell } from 'react-native-tableview-simple';
import Slider from '@react-native-community/slider';
import BottomBar from '../components/BottomBar';
import * as FileSystem from 'expo-file-system';

function Settings({ route }){
    const [modalVisible, setModalVisible] = useState(false);  // Credits modal
    const [infoModalVisible, setInfoModalVisible] = useState(false); // Info modal
    const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Account details modal
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Confirm deletion modal
    const [fontSize, setFontSize] = useState(16); // Default font size
    const { userDetails } = route.params || {};

    const handleDeleteAccount = async () => {
        try{
            setConfirmDeleteVisible(false);
            const filePath = `${FileSystem.documentDirectory}users.json`;
            // Check if Json file exists
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (!fileInfo.exists) {
                Alert.alert("Error", "No account data found.");
                return;
            }
            // Read and parse the JSON file
            const content = await FileSystem.readAsStringAsync(filePath);
            let users = JSON.parse(content);
            // Find current user (email is unique)
            const updatedUsers = users.filter(u => u.email !== userDetails.email);
            // Delete the acount
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedUsers));
            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            // Redirect to Login
            navigation.navigate("LogIn");
        } catch (error) {
            Alert.alert("Error", "An error occurred while deleting your account.");
        }
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
            <TableView>
                {/* About Header*/}
                <Section header="About" headerTextStyle={styles.headerText}>
                    {/* Info */}
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Info</Text>
                            </View>
                        </TouchableOpacity>} />
                    {/* Credits */}
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Credits</Text>
                            </View>
                        </TouchableOpacity>} />
                </Section>
                {/* Display Header */}
                <Section header="Display" headerTextStyle={styles.headerText}>
                    <Cell cellContentView={
                        <View style={styles.menuItem}>
                            <Text style={styles.menuItemText}>Font Size</Text>
                            <Slider style={styles.slider} minimumValue={12} maximumValue={24} step={1} value={fontSize} onValueChange={(value) => setFontSize(value)}/>
                            <Text style={styles.fontSizeLabel}>{fontSize}px</Text>
                        </View>} />
                </Section>
                {/* Account Header */}
                <Section header="Account" headerTextStyle={styles.headerText}>
                    {/* Details */}
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setDetailsModalVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Details</Text>
                            </View>
                        </TouchableOpacity>} />
                    {/* Delete */}
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setConfirmDeleteVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={[styles.menuItemText, { color: 'red' }]}>Delete Account</Text>
                            </View>
                        </TouchableOpacity>} />
                </Section>

            </TableView>
        </ScrollView>

        {/* Info Modal */}   
        <Modal visible={infoModalVisible} animationType="slide" transparent={true} onRequestClose={() => setInfoModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Info</Text>
                    <Text style={styles.modalText}>We strive to provide an easy way for all things Panama Immigration. Our team has personally lived in Panama and is a proud advocate of the country. We are not official ambassadors or receive any commission from Panama.{"\n"}{"\n"}If you have any concerns or questions, please contact us: help@panamaimmigration.com</Text>
                    <Button title="Close" onPress={() => setInfoModalVisible(false)} />
                </View>
            </View>
        </Modal>  

        {/* Credits Modal */}   
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Credits</Text>
                    <Text style={styles.modalHeader}>Packages Used</Text>
                    <Text style={styles.modalText}>Navigation, Async Storage, File System, Tableview, Bottom Tab, Icons, Slider, Picker, Location, Luxon, Camera, Image Picker</Text>
                    <Text style={styles.modalHeader}>Assets From Unsplash</Text>
                    <Text style={styles.modalText}>
                        <Text onPress={() => Linking.openURL('https://unsplash.com/@luchox23?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={styles.link}>Luis Gonzalez</Text>,{' '}
                        <Text onPress={() => Linking.openURL('https://unsplash.com/@nguyendhn?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={styles.link}>Nguyen Dang Hoang Nhu</Text>,{' '}
                        <Text onPress={() => Linking.openURL('https://unsplash.com/@nordwood?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={styles.link}>NordWood Themes</Text>,{' '}
                        <Text onPress={() => Linking.openURL('https://unsplash.com/@viazavier?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={styles.link}>Laura Ockel</Text>,{' '}
                        <Text onPress={() => Linking.openURL('https://unsplash.com/@benjaminsweet?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={styles.link}>Ben Sweet</Text>
                    </Text>
                    <View style={styles.creditsUol}>
                        <Image style={styles.logo} source={require('../assets/uol-logo.png')}/>
                        <Text style={styles.modalText}>10 March 2025{"\n"}University Of London</Text>
                    </View>
                    <Button title="Close" onPress={() => setModalVisible(false)} />
                </View>
            </View>
        </Modal>

        {/* Details Modal */}   
        <Modal visible={detailsModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDetailsModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Details</Text>
                    <Text style={styles.modalText}>Email: {userDetails?.email}{"\n"}Username: {userDetails?.username}{"\n"}Password: {userDetails?.password}{"\n"}Newsletter: {userDetails?.newsletter ? "Subscribed" : "Not Subscribed"} </Text>
                    <Button title="Close" onPress={() => setDetailsModalVisible(false)} />
                </View>
            </View>
        </Modal>       

        {/* Confirm Delete Modal */}
        <Modal visible={confirmDeleteVisible} animationType="slide" transparent={true} onRequestClose={() => setConfirmDeleteVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Are you sure?</Text>
                    <Text style={styles.modalText}>This action cannot be undone.</Text>
                    <View style={styles.buttonRow}>
                        <Button title="Cancel" onPress={() => setConfirmDeleteVisible(false)} />
                        <Button title="Delete" color="red" onPress={handleDeleteAccount} />
                    </View>
                </View>
            </View>
        </Modal>        

        <BottomBar />
      </SafeAreaView>
    )
}

export default Settings;

const styles = StyleSheet.create({
    // Settings Menu
    safeArea: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 12
    },  
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    menuItemText: {
        fontSize: 20,
    },
    // Slider
    slider: {
        width: 150,
        marginLeft: 10,
    },
    fontSizeLabel: {
        fontSize: 20,
        marginLeft: 10,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: 300,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalHeader: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    creditsUol: {
        flexDirection: 'row',
    },
    logo: {
        width: 40,  
        height: 40, 
        marginRight: 15,
        resizeMode: 'contain'
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline'
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    }
});