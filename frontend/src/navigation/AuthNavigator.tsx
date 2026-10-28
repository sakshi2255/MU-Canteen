import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../views/auth/LoginScreen';
import { RegisterScreen } from '../views/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../views/auth/ForgotPasswordScreen';
import { AccessDeniedScreen } from '../views/auth/AccessDeniedScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="AccessDeniedScreen" component={AccessDeniedScreen} />
    </Stack.Navigator>
  );
};

