import { StyleSheet, Text, View } from 'react-native';

export default function AuthView({ navigation }) {
    return (
      <View style={ styles.container }>
        <Text style={{ color: '#fff' }}>Hello Tractor Authentication</Text>
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
      justifyContent: 'center'
  },
  footerContainer: {
      flex: 1 / 3,
      alignItems: 'center'
  }
});
  