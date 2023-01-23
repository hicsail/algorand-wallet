import { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';

export default function AuthView({ navigation }) {
    const [balance, setBalance] = useState(0.0);

    return (
      <View style={ styles.container }>
        <Text style={styles.balance}>$ { balance }</Text>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
  },
  balance: {
      fontSize: 42,
  }
});
  