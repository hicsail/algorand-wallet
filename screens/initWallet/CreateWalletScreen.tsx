import { StyleSheet, Text, View, FlatList } from 'react-native';
import NavButton from '../../components/NavButton';

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
          <NavButton label='Next' onPress={signInHandler}/>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 50,
    backgroundColor: '#1c1e24'

  },
  instructions: {
    marginTop: 5,
    color: '#fff',
    width: 300,
  },
  item: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    paddingTop: 12,
    paddingRight: 25
  }
});
  