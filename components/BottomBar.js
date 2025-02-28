import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');

const BottomBar = ({ userDetails}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeScreen', { userDetails })}>
            <Icon name="home" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile', { userDetails })}>
            <Icon name="user" size={24} color="white" />
            </TouchableOpacity>
           
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings', { userDetails })}>
            <Icon name="cog" size={24} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default BottomBar;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.primaryBlack,
        paddingVertical: height * 0.02,
        minHeight: 50,
        maxHeight: 80,
      },
    button: {
        padding: width * 0.03,
    },
});
