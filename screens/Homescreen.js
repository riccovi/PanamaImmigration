import { View, Text, StyleSheet } from 'react-native';

function HomeScreen({route}){
  return (
    <View style={styles.container}>
      <Text>Welcome, {route.params.username}!</Text>
    </View>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });