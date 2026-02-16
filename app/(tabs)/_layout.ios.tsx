
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  // Green for active, Red for inactive
  const activeColor = '#006400'; // Green
  const inactiveColor = '#DC143C'; // Red

  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon 
          sf={{ default: 'house', selected: 'house.fill' }} 
          style={{ 
            tintColor: inactiveColor,
            selectedTintColor: activeColor 
          }}
        />
        <Label style={{ 
          color: inactiveColor,
          selectedColor: activeColor 
        }}>
          Home
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon 
          sf={{ default: 'person', selected: 'person.fill' }} 
          style={{ 
            tintColor: inactiveColor,
            selectedTintColor: activeColor 
          }}
        />
        <Label style={{ 
          color: inactiveColor,
          selectedColor: activeColor 
        }}>
          Profile
        </Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
