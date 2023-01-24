import { StyleSheet, Text, View, FlatList } from 'react-native';
import NavButton from '../../components/NavButton';
const algosdk = require('algosdk');

const renderWord = ({ item }) => (
  <Text style={styles.item}>{item.id}. {item.word}</Text>
);

export default function CreateWalletView({ navigation }) {
    const seedPhrase = [
      { word: 'wordword', id: '1'},
      { word: 'wordword', id: '2'},
      { word: 'wordword', id: '3'},
      { word: 'wordword', id: '4'},
      { word: 'wordword', id: '5'},
      { word: 'wordword', id: '6'},
      { word: 'wordword', id: '7'},
      { word: 'wordword', id: '8'},
      { word: 'wordword', id: '9'},
      { word: 'wordword', id: '10'},
      { word: 'wordword', id: '11'},
      { word: 'wordword', id: '12'}
    ]

    let account = algosdk.generateAccount();
    let passphrase = algosdk.secretKeyToMnemonic(account.sk);
    console.log(passphrase)

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
    backgroundColor: '#fff',
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
    color: '#000',
    width: 300
  },
  item: {
    flex: 1,
    color: '#000',
    fontSize: 18,
    paddingTop: 12,
    paddingRight: 25
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});
  