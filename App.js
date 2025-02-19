import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LogIn from './screens/Login';
import HomeScreen from './screens/Homescreen';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import WhyPanama from './screens/WhyPanama';
import EligibilityQuiz from './screens/EligibilityQuiz';
import CriminalCheck from './screens/CriminalCheck';

const Stack = createNativeStackNavigator() 

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" options={{headerShown: false}} component={HomeScreen} />
        <Stack.Screen name="LogIn" options={{headerShown: false}} component={LogIn} />
        <Stack.Screen name="Profile" options={{headerShown: false}} component={Profile} />
        <Stack.Screen name="Settings" options={{headerShown: false}} component={Settings} />
        <Stack.Screen name="WhyPanama" options={{headerShown: false}} component={WhyPanama} />
        <Stack.Screen name="EligibilityQuiz" options={{headerShown: false}} component={EligibilityQuiz} />
        <Stack.Screen name="CriminalCheck" options={{headerShown: false}} component={CriminalCheck} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}