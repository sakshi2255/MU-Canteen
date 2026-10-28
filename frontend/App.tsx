import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CampusProvider } from './src/context/CampusContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CampusProvider>
          <CartProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </CartProvider>
        </CampusProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
