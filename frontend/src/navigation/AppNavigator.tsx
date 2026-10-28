import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { OperatorNavigator } from './OperatorNavigator';
import { AdminNavigator } from './AdminNavigator';

export const AppNavigator = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderRoleNavigator = () => {
    if (!user) {
      return <AuthNavigator />;
    }

    switch (role) {
      case 'operator':
        return <OperatorNavigator />;
      case 'admin':
        return <AdminNavigator />;
      case 'faculty':
      case 'student':
      default:
        return <StudentNavigator />;
    }
  };

  return <NavigationContainer>{renderRoleNavigator()}</NavigationContainer>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

