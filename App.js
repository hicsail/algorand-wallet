import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Navigator from './routes/NavStack'

const Stack = createNativeStackNavigator();

export default function App() {
  const [showAppOptions, setShowAppOptions] = useState(false);

  return (
    <Navigator/>
  )
};