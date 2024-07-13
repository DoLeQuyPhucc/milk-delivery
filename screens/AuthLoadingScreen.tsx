import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';
import { AppDispatch } from '@/redux/store/store';
import { callApi } from '@/hooks/useAxios';
import { RootStackParamList } from '@/layouts/types/navigationTypes';

type AuthLoadingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AuthLoadingScreen'
>;

const AuthLoadingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const userProfile = await fetchUserProfile(token);
          dispatch(setUser(userProfile));
          navigation.navigate('Main');
        } else {
          navigation.navigate('WelcomeScreen');
        }
      } catch (error) {
        console.error('Error checking accessToken:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async (token: string) => {
      try {
        const data = await callApi('GET', '/api/auth/me');
        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    };

    checkToken();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null;
};

export default AuthLoadingScreen;
