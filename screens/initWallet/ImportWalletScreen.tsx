import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import NavButton from '../../components/NavButton';
import { useState } from 'react';

export default function ImportWalletView({ navigation }) {
    const [seedPhrase, setSeedPhrase] = useState([
      { word: '', id: '1' },
      { word: '', id: '2' },
      { word: '', id: '3' },
      { word: '', id: '4' },
      { word: '', id: '5' },
      { word: '', id: '6' },
      { word: '', id: '7' },
      { word: '', id: '8' },
      { word: '', id: '9' },
      { word: '', id: '10' },
      { word: '', id: '11' },
      { word: '', id: '12' }
    ]);

    const renderWord = ({ item }) => (
      <TextInput 
        style={styles.item}
        onChangeText={(val) => {
          let list = [...seedPhrase]
          list[parseInt(item.id) - 1].word = val
          setSeedPhrase(list)
        }}>
        {item.id}. {item.word}
      </TextInput>
    );
    
    const signInHandler = (view) => {
      navigation.navigate('AuthScreen');
    }

    return (
      <View style={ styles.container }>
        <Text style={styles.instructions}>Save your seed phrase in a secure location. Never share your seed phrase with anyone.</Text>
        <View>
          <FlatList
            numColumns={2}
            keyExtractor={item => item.id}
            data={seedPhrase}
            renderItem={renderWord}
            style={styles.seedPhrase}/>
          <View style={ styles.bottomContainer}>
            <NavButton label='Next' onPress={signInHandler}/>
          </View>
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
    paddingTop: 80
  },
  header: {
    color: '#fff',
    fontSize: 18
  },
  seedPhrase: {
    flexDirection: 'row',

  },
  instructions: {
    marginTop: 5,
    color: '#fff',
    width: 300
  },
  item: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingTop: 12,
    paddingRight: 25,
    width: 150
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});
  