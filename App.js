import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Navigator from './routes/NavStack'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Navigator/>
  )
};