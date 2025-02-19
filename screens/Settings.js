import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Button, Alert, StyleSheet } from 'react-native';
import { TableView, Section, Cell } from 'react-native-tableview-simple';
import Slider from '@react-native-community/slider';
import BottomBar from '../components/BottomBar';

function Settings({}){
    const [modalVisible, setModalVisible] = useState(false);  // Credits modal
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Confirm deletion modal
    const [fontSize, setFontSize] = useState(16); // Default font size

    const handleDeleteAccount = () => {
        //setConfirmDeleteVisible(false);
        Alert.alert("Account Deleted", "Your account has been successfully deleted.");
        // Add logic to delete the account from storage (e.g., remove from JSON file)
      };
    return (
      <SafeAreaView>
        <ScrollView>
            <TableView>
                
                {/* Credits Option*/}
                <Section header="About">
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Credits</Text>
                            </View>
                        </TouchableOpacity>} />
                </Section>
                {/* Font Size Slider */}
                <Section header="Display">
                    <Cell cellContentView={
                        <View style={styles.menuItem}>
                            <Text style={styles.menuItemText}>Font Size</Text>
                            <Slider style={styles.slider} minimumValue={12} maximumValue={24} step={1} value={fontSize} onValueChange={(value) => setFontSize(value)}/>
                            <Text style={styles.fontSizeLabel}>{fontSize}px</Text>
                        </View>} />
                </Section>
                {/* Delete Account */}
                <Section header="Account">
                    <Cell cellContentView={
                        <TouchableOpacity onPress={() => setConfirmDeleteVisible(true)}>
                            <View style={styles.menuItem}>
                                <Text style={[styles.menuItemText, { color: 'red' }]}>Delete Account</Text>
                            </View>
                        </TouchableOpacity>} />
                </Section>

            </TableView>
        </ScrollView>

        {/* Credits Modal */}   
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Credits</Text>
                    <Text style={styles.modalText}>xxx{"\n"}yyy</Text>
                    <Button title="Close" onPress={() => setModalVisible(false)} />
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
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuItemText: {
        fontSize: 16,
    },
    // Slider
    slider: {
        width: 150,
        marginLeft: 10,
    },
    fontSizeLabel: {
        fontSize: 16,
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
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    }
});