import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import store from '@/redux/store/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '@/screens/WelcomeScreen';
import ProductDetail from '../screens/ProductDetail';
import PackageDetail from '../screens/PackageDetail';
import OrderFormScreen from '../screens/OrderFormScreen';
import OrderResultScreen from '../screens/OrderResultScreen';
import CartScreen from '../screens/CartScreen';
import OrderScreen from '@/screens/OrderScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import CustomBottomTab, { TabBarProps } from './BottomBar';
import fonts from '@/config/fonts';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types/navigationTypes';
import useAuth from '@/hooks/useAuth';
import AddressScreen from '@/screens/AddressScreen';
import AddAddressScreen from '@/screens/AddAddressScreen';
import NotificationScreen from '@/screens/NotificationScreen';
import OrderDetailScreen from '@/screens/OrderDetail';
import { DEEP_LINKING_PREFIX } from '@env';
import SearchResultsScreen from '@/screens/SearchResultScreen';
import linking from '@/config/linking';
import FilterResults from '@/screens/FilterResults';
import EditProfileScreen from '@/screens/EditProfileScreen';
import ChangePasswordScreen from '@/screens/ChangePasswordScreen';

const Stack = createStackNavigator<RootStackParamList>();

const tabBarProps: TabBarProps[] = [
  {
    route: 'Home',
    component: HomeScreen,
    tabBarLabel: 'Home',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'home-outline',
    },
  },
  {
    route: 'Orders',
    component: OrderScreen,
    tabBarLabel: 'Orders',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'cart-outline',
    },
  },
  {
    route: 'Notifications',
    component: NotificationScreen,
    tabBarLabel: 'Notifitcations',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'notifications-outline',
    },
  },
  {
    route: 'Profile',
    component: ProfileScreen,
    tabBarLabel: 'Profile',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'person-outline',
    },
  },
];

export default function Navigation() {
  useAuth(); // Call the custom hook

  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts(fonts);
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (accessToken && refreshToken) {
          setInitialRoute('Main');
        } else {
          setInitialRoute('WelcomeScreen');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded || !initialRoute) {
    return null;
  }

  return (
    <Provider store={store}>
      <NavigationContainer
        theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        linking={linking}
      >
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <CustomBottomTab tabs={tabBarProps} />}
          </Stack.Screen>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false }} />
          <Stack.Screen name="PackageDetail" component={PackageDetail} options={{ headerShown: false }} />
          <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FilterResults" component={FilterResults} options={{ headerShown: false }} />
          <Stack.Screen name="OrderScreen" component={OrderScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: true }} />
          <Stack.Screen name="OrderForm" component={OrderFormScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderResult" component={OrderResultScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddressScreen" component={AddressScreen} options={{ headerShown: true }} />
          <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} options={{ headerShown: true }} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}
