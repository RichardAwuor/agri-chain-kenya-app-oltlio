
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon 
          sf={{ default: 'house', selected: 'house.fill' }} 
          style={{ 
            tintColor: colors.kenyaRed,
            selectedTintColor: colors.kenyaGreen 
          }}
        />
        <Label style={{ 
          color: colors.kenyaRed,
          selectedColor: colors.kenyaGreen 
        }}>
          Home
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon 
          sf={{ default: 'person', selected: 'person.fill' }} 
          style={{ 
            tintColor: colors.kenyaRed,
            selectedTintColor: colors.kenyaGreen 
          }}
        />
        <Label style={{ 
          color: colors.kenyaRed,
          selectedColor: colors.kenyaGreen 
        }}>
          Profile
        </Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
