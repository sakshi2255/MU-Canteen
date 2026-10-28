import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ListOrdered, QrCode, Utensils, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';

// Screens
import { OperatorDashboard } from '../views/operator/OperatorDashboard';
import { OrderQueueScreen } from '../views/operator/OrderQueueScreen';
import { PickupVerificationScreen } from '../views/operator/PickupVerificationScreen';
import { MenuManagementScreen } from '../views/operator/MenuManagementScreen';
import { OperatorReportsScreen } from '../views/operator/OperatorReportsScreen';
import { StudentProfileScreen } from '../views/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const OperatorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="OperatorDashboardTab"
        component={OperatorDashboard}
        options={{
          tabBarLabel: 'Console',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="OrderQueueTab"
        component={OrderQueueScreen}
        options={{
          tabBarLabel: 'Kitchen Queue',
          tabBarIcon: ({ color, size }) => <ListOrdered size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PickupVerificationTab"
        component={PickupVerificationScreen}
        options={{
          tabBarLabel: 'Verify Token',
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MenuManagementTab"
        component={MenuManagementScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="OperatorProfileTab"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const OperatorNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OperatorTabs" component={OperatorTabs} />
      <Stack.Screen name="OperatorDashboard" component={OperatorDashboard} />
      <Stack.Screen name="OrderQueueScreen" component={OrderQueueScreen} />
      <Stack.Screen name="PickupVerificationScreen" component={PickupVerificationScreen} />
      <Stack.Screen name="MenuManagementScreen" component={MenuManagementScreen} />
      <Stack.Screen name="OperatorReportsScreen" component={OperatorReportsScreen} />
    </Stack.Navigator>
  );
};
