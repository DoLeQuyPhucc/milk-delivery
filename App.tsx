import React from 'react';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import store from './redux/store/store';
import Navigation from './layouts/Navigation';
import { NativeBaseProvider } from 'native-base';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import fonts from './config/fonts';

export default function App() {
  let [fontsLoaded] = useFonts(fonts);

  if (!fontsLoaded) {
    return null;
  }

  // // Remove this method to stop OneSignal Debugging
  // OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // // OneSignal Initialization
  // OneSignal.initialize("f2077189-aa69-4723-bca2-96296991f07a");

  // // requestPermission will show the native iOS or Android notification permission prompt.
  // // We recommend removing the following code and instead using an In-App Message to prompt for notification permission
  // OneSignal.Notifications.requestPermission(true);

  // // Method for listening for notification clicks
  // OneSignal.Notifications.addEventListener('click', (event) => {
  //   console.log('OneSignal: notification clicked:', event);
  // });

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <Navigation />
      </NativeBaseProvider>
    </Provider>
  );
}
