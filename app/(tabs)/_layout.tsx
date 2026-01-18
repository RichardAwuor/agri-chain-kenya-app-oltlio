import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    loadUserType();
  }, []);

  const loadUserType = async () => {
    try {
      const type = await AsyncStorage.getItem('userType');
      console.log('TabLayout: User type loaded', type);
      setUserType(type);
    } catch (error) {
      console.error('TabLayout: Error loading user type:', error);
    }
  };

  // Define the tabs configuration based on user type
  const getTabsForUserType = (): TabBarItem[] => {
    const baseTabs: TabBarItem[] = [
      {
        name: '(home)',
        route: '/(tabs)/(home)/',
        icon: 'home',
        label: 'Home',
      },
    ];

    // Add Profile tab for all users
    baseTabs.push({
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    });

    return baseTabs;
  };

  const tabs = getTabsForUserType();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
