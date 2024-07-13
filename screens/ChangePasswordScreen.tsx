import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@/hooks/useNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { callApi } from '@/hooks/useAxios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      
      await callApi('POST', '/api/auth/signin', {
        userName: user.userName,  // Assuming the user object contains the username
        password: currentPassword,
      });

      // If the current password is correct, proceed to change the password
      await callApi('PATCH', `/api/users/edit/${user._id}`, {
        password: newPassword,
      });

      // Remove tokens from AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      // Notify the user and navigate to WelcomeScreen
      Alert.alert('Success', 'Password changed successfully. Please log in again.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('WelcomeScreen'),
        },
      ]);
    } catch (error: any) {
      // Handle error from the sign-in or editUser API call
      if (error.response) {
        const { message } = error.response.data;
        if (error.response.status === 400 || error.response.status === 404) {
          Alert.alert('Error', message || 'Error with credentials or user not found');
        } else {
          Alert.alert('Error', 'There was an error changing your password');
        }
      } else {
        Alert.alert('Error', 'There was an error changing your password');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Change Password" onPress={handleChangePassword} />
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
