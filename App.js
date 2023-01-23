import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InitWallet from './screens/initWallet/InitWalletScreen';
import CreateWallet from './screens/initWallet/CreateWalletScreen';
import ImportWallet from './screens/initWallet/ImportWalletScreen';
import AuthScreen from './screens/initWallet/AuthScreen';
import HomeScreen from './screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0
          },
          headerTintColor: '#000',
          headerTitleAlign: 'center'
        }}>
        <Stack.Screen 
          name="InitWallet" 
          options={{ headerShown: false }} 
          component={InitWallet} />
        <Stack.Screen 
          name="CreateWallet" 
          options={{ 
            title: "Seed Phrase", 
            headerShadowVisible: false 
          }} 
          component={CreateWallet} />
        <Stack.Screen 
          name="ImportWallet" 
          options={{ 
            title: "Import", 
            headerShadowVisible: false 
          }} 
          component={ImportWallet} />
        <Stack.Screen 
          name="AuthScreen" 
          options={{ 
            title: "Login/Signup", 
            headerShadowVisible: false 
          }} 
          component={AuthScreen} />
        <Stack.Screen 
          name="Home" 
          options={{ headerShown: false }} 
          component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};