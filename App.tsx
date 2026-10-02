import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Splash from './src/components/Splash';
import Toast from './src/components/Toast';
import Router from './src/navigation/Router';
import { AppProvider, useApp } from './src/store/AppProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { c, ready, splashing, endSplash } = useApp();
  // The native splash is plain navy, so handing over to the animated splash is seamless.
  const onLayout = useCallback(() => { SplashScreen.hideAsync().catch(() => {}); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: ready ? c.bg : '#0F1B2D' }} onLayout={onLayout}>
      {ready && <Router />}
      {ready && splashing && <Splash onFinish={endSplash} />}
      <Toast />
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
