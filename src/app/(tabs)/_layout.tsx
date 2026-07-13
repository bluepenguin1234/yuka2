import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { colors } from '../../lib/theme';

// On native, react-navigation sizes the bar itself (and adds the home-indicator
// safe area — never hardcode height there). On web there is no inset handling,
// so give the bar explicit room to keep icons from clipping.
const webBarSizing = Platform.OS === 'web' ? { height: 64, paddingTop: 6, paddingBottom: 8 } : null;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          ...webBarSizing,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Ionicons name="scan-circle" color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
