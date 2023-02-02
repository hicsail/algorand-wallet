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
      <View style={ styles.inputRow }>
        <Text style={ styles.rowId }>{ parseInt(item.id) < 10 ? '   '+item.id+'.  ' : ' '+item.id+'.  ' }</Text>
        <TextInput
          style={styles.item}
          onChangeText={(val) => {
            let list = [...seedPhrase]
            list[parseInt(item.id) - 1].word = val
            setSeedPhrase(list)
          }}>
          {item.word}
        </TextInput>
      </View>
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
          <View style={styles.bottomContainer}>
            <NavButton label='Next' onPress={signInHandler}/>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80
  },
  header: {
    color: '#000',
    fontSize: 18
  },
  seedPhrase: {
    flexDirection: 'row',

  },
  instructions: {
    marginTop: 5,
    color: '#000',
    width: 300
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  rowId: {
    fontSize: 18,
    color: '#000'
  },
  item: {
    flex: 1,
    color: '#000',
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
  