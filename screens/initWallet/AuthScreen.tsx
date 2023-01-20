import { useState } from 'react';
import { Text, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';

export default function AuthView({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submitHandler = () => {
      navigation.navigate('Home');
    };
    
    return (
      <View style={ styles.container }>
        <TextInput 
          style={styles.inputField}
          placeholder="Email"
          placeholderTextColor="#fff"
          onChangeText={(val) => setEmail(val)}/>
        <TextInput 
          style={styles.inputField}
          placeholder="Password"
          placeholderTextColor="#fff"
          onChangeText={(val) => setEmail(val)}/>
        <TouchableOpacity style={styles.submitButton} onPress={() => submitHandler()}>
          <Text style={styles.submitText}>Login</Text>
        </TouchableOpacity>
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
  inputField: {
    borderWidth: 1,
    borderColor: '#adacac',
    width: '75%',
    height: 50,
    color: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    marginBottom: 20
  },
  submitButton: {
    width: '75%',
    height: 50,
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: "center",alignItems: "center"
  },
  submitText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
  