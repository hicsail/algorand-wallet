import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function HomeView({ navigation }) {
    const createWalletHandler = (view) => {
        navigation.navigate('CreateWallet');
    }

    const importWalletHandler = () => {
      navigation.navigate('ImportWallet');
    }
 
    return (
      <View style={ styles.container }>
        <Text style={{ color: '#fff' }}>Algorand Mobile Wallet</Text>
        <StatusBar style="auto" />
        <View style={styles.footerContainer}>
          <Button title='Create Wallet' onPress={createWalletHandler}/>
          <Button title='Import Wallet' onPress={importWalletHandler}/>
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
  