import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ImportWalletView({ navigation }) {
    const pressHandler = () => {
        navigation.navigate('back');
    }

    return (
      <View style={ styles.container }>
        <Text style={{ color: '#fff' }}>Algorand Mobile Wallet</Text>
        <TextInput 
          style={{ color: '#fff' }}
          placeholder="word"
          onChangeText={(val) => setName(val)}/>
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
  