import { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';

export default function AuthView({ navigation }) {
    return (
      <View style={ styles.container }>
        <Text>Home Screen</Text>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
  }
});
  