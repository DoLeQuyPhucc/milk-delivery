import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@/hooks/useNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { Button } from 'react-native-paper';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avartaImage || 'data:image/jpeg;base64,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' }} style={styles.profileImage} />
        <Text style={styles.userName}>{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
      <View style={styles.body}>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Order History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('EditProfileScreen')}>
          <Text style={styles.itemText}>Edit Information</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangePasswordScreen')}>
          <Text style={styles.itemText}>Change Password</Text>
        </TouchableOpacity>
        <Button icon="logout" mode="contained" buttonColor='red' onPress={handleLogout}>
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  body: {
    padding: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  itemText: {
    fontSize: 18,
  },
});
