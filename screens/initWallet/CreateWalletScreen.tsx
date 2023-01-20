import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';

import { useState } from 'react';

const renderWord = ({ item }) => (
  <Text style={styles.item}>{item.word}</Text>
);

export default function CreateWalletView({ navigation }) {
    const seedPhrase = [
      { word: 'word1', id: '1'},
      { word: 'word2', id: '2'},
      { word: 'word3', id: '3'},
      { word: 'word4', id: '4'},
      { word: 'word5', id: '5'},
      { word: 'word6', id: '6'},
      { word: 'word7', id: '7'},
      { word: 'word8', id: '8'},
      { word: 'word9', id: '9'},
      { word: 'word10', id: '10'},
      { word: 'word11', id: '11'},
      { word: 'word12', id: '12'}
    ]

    return (
      <View style={ styles.container }>
        <Text style={styles.header}>Seed Phrase</Text>
        <Text style={styles.instructions}>Save your seed phrase in a secure location. Never share your seed phrase with anyone.</Text>
        <StatusBar style="auto" />
        <View>
          <FlatList
            keyExtractor={item => item.id}
            data={seedPhrase}
            renderItem={renderWord}
            style={styles.seedPhrase}/>
        </View>
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
    paddingTop: 100
},
header: {
  color: '#fff',
  fontSize: 18
},
seedPhrase: {
  flex: 1
},
instructions: {
  marginTop: 5,
  color: '#fff',
  paddingLeft: 30,
  paddingRight: 30
},
item: {
  flex: 1,
  color: '#fff',
  fontSize: 18,
  paddingTop: 12
},
footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
}
});
  