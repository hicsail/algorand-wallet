import { useState } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';

export default function AuthView() {
    const [assetList, setAssetList] = useState([
        { name: 'Algorand', amount: '0.00'},
        { name: 'USDC', amount: '0.00'}
    ]);

    const renderAsset = ({ item }) => (
        <View style={styles.assetCard}>
            <Text style={styles.assetName}>{ item.name }</Text>
            <Text style={styles.assetAmount}>{ item.amount }</Text>
        </View>
    );

    return (
      <View style={ styles.container }>
        <FlatList
            numColumns={1}
            keyExtractor={item => item.name}
            data={assetList}
            renderItem={renderAsset}
        />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#ffa',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
  },
  assetCard: {
      fontSize: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#faa',
      width: '100%',
      height: 80,
      paddingRight: 5,
      paddingLeft: 5,
      alignItems: 'center',
      justifyContent: 'center'
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  assetAmount: {
    fontSize: 14
  }
});
  