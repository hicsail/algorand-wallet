import { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Balance from './Balance';
import AssetList from './AssetList';

export default function AuthView({ navigation }) {
    const [balance, setBalance] = useState(0.0);

    return (
      <View style={ styles.container }>
        <Balance/>
        <AssetList/>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      paddingLeft: 30,
      paddingRight: 30,
      paddingTop: 50
  },
  balance: {
      fontSize: 42,
  }
});
  