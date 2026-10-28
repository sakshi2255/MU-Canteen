import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Store, Users, Settings, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';

// Screens
import { AdminDashboard } from '../views/admin/AdminDashboard';
import { CampusManagementScreen } from '../views/admin/CampusManagementScreen';
import { UserManagementScreen } from '../views/admin/UserManagementScreen';
import { SystemSettingsScreen } from '../views/admin/SystemSettingsScreen';
import { AuditLogsScreen } from '../views/admin/AuditLogsScreen';
import { StudentProfileScreen } from '../views/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminTabs = () => {
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
        name="AdminDashboardTab"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Campus',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CampusManagementTab"
        component={CampusManagementScreen}
        options={{
          tabBarLabel: 'Canteens',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="UserManagementTab"
        component={UserManagementScreen}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SystemSettingsTab"
        component={SystemSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="CampusManagementScreen" component={CampusManagementScreen} />
      <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
      <Stack.Screen name="SystemSettingsScreen" component={SystemSettingsScreen} />
      <Stack.Screen name="AuditLogsScreen" component={AuditLogsScreen} />
    </Stack.Navigator>
  );
};
