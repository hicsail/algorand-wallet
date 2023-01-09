import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/home/Button';

export default function ImportWalletView({ navigation }) {
    const pressHandler = () => {
        navigation.navigate('back');
    }

    return (
      <View style={ styles.container }>
        <Text style={{ color: '#fff' }}>Algorand Mobile Wallet</Text>
        <StatusBar style="auto" />
        <View style={styles.footerContainer}>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    // , flex: 1, alignItems: 'center', justifyContent: 'center'
},
footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
}
});
  