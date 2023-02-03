import { useState } from 'react';
import { Text, StyleSheet, View, FlatList, Image } from 'react-native';

export default function AuthView() {
    const [assetList, setAssetList] = useState([
        { ticker: 'ALGO', amount: '1,000,000.00', img: require('../../assets/algorand_logo.webp')},
        { ticker: 'USDC', amount: '2,000,000.00', img: require('../../assets/usdc_logo.webp')}
    ]);

    const renderAsset = ({ item }) => (
        <View style={styles.assetCard}>
            <Image style={styles.assetIcon} source={item.img} />
            <Text style={styles.assetAmount}> { item.amount }  { item.ticker }</Text>
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
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
  },
  assetCard: {
      fontSize: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: '#000',
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 5,
      paddingLeft: 5
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  assetAmount: {
    fontSize: 16
  },
  assetIcon: {
    width: 50,
    height: 50
  }
});
  