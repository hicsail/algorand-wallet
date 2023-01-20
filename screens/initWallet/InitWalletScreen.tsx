import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import NavButton from '../../components/NavButton';

export default function HomeView({ navigation }) {
    const createWalletHandler = (view) => {
        navigation.navigate('CreateWallet');
    }

    const importWalletHandler = () => {
      navigation.navigate('ImportWallet');
    }
 
    return (
      <View style={ styles.container }>
        <StatusBar style="auto" />
        <View style={styles.footerContainer}>
          <NavButton label='Create Wallet' onPress={createWalletHandler}/>
          <NavButton label='Import Wallet' onPress={importWalletHandler}/>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#25292e',
      alignItems: 'center',
      justifyContent: 'center'
  },
  footerContainer: {
      flex: 1 / 3,
      alignItems: 'center'
  }
});
  