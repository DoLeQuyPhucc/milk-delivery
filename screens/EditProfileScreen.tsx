import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@/hooks/useNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { setUser } from '@/redux/slices/userSlice';
import { callApi } from '@/hooks/useAxios';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  const handleSave = async () => {
    try {
      const response = await callApi('PATCH', `/api/users/edit/${user._id}`, {
        email,
        firstName,
        lastName,
        phoneNumber,
      });
  
      // Log the response to see its structure
      console.log('Response:', response);
  
      // Adjust this check based on the actual response structure
      if (response.user) {
        dispatch(setUser(response.user)); 
        Alert.alert('Success', 'User information updated successfully');
        navigation.goBack();
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error updating user information:', error);
      Alert.alert('Error', 'There was an error updating your information');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Last Name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});
