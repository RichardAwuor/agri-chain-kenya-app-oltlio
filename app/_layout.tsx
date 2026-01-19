
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { BACKEND_URL } from "@/utils/api";
// Note: Error logging is auto-initialized via index.ts import

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "welcome", // Start with welcome screen
};

// Function to seed location data on app startup
async function seedLocationData() {
  try {
    // Check if we've already seeded the data
    const hasSeeded = await AsyncStorage.getItem('locationDataSeeded');
    if (hasSeeded === 'true') {
      console.log('RootLayout: Location data already seeded, skipping');
      return;
    }

    console.log('RootLayout: Seeding Kenya location data...');
    
    // Seed Kenya locations
    const kenyaResponse = await fetch(`${BACKEND_URL}/api/seed/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (kenyaResponse.ok) {
      const kenyaResult = await kenyaResponse.json();
      console.log('RootLayout: Kenya location data seeded successfully', kenyaResult);
    } else {
      console.error('RootLayout: Failed to seed Kenya location data', kenyaResponse.status);
    }

    console.log('RootLayout: Seeding US location data...');
    
    // Seed US locations
    const usResponse = await fetch(`${BACKEND_URL}/api/locations/seed-us`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (usResponse.ok) {
      const usResult = await usResponse.json();
      console.log('RootLayout: US location data seeded successfully', usResult);
    } else {
      console.error('RootLayout: Failed to seed US location data', usResponse.status);
    }

    // Mark as seeded only if both succeeded
    if (kenyaResponse.ok && usResponse.ok) {
      await AsyncStorage.setItem('locationDataSeeded', 'true');
      console.log('RootLayout: All location data seeded successfully');
    }
  } catch (error) {
    console.error('RootLayout: Error seeding location data:', error);
    // Don't block app startup if seeding fails
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Seed location data after splash screen is hidden
      seedLocationData();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)", // System Blue
      background: "rgb(242, 242, 247)", // Light mode background
      card: "rgb(255, 255, 255)", // White cards/surfaces
      text: "rgb(0, 0, 0)", // Black text for light mode
      border: "rgb(216, 216, 220)", // Light gray for separators/borders
      notification: "rgb(255, 59, 48)", // System Red
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)", // System Blue (Dark Mode)
      background: "rgb(1, 1, 1)", // True black background for OLED displays
      card: "rgb(28, 28, 30)", // Dark card/surface color
      text: "rgb(255, 255, 255)", // White text for dark mode
      border: "rgb(44, 44, 46)", // Dark gray for separators/borders
      notification: "rgb(255, 69, 58)", // System Red (Dark Mode)
    },
  };
  return (
    <>
      <StatusBar style="auto" animated />
        <ThemeProvider
          value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
        >
          <WidgetProvider>
            <GestureHandlerRootView>
            <Stack>
              {/* Welcome Screen - First screen users see */}
              <Stack.Screen 
                name="welcome" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />

              {/* Main app with tabs */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Producer Screens */}
              <Stack.Screen 
                name="producer/registration" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="producer/reporting" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />

              {/* Regulator Screens */}
              <Stack.Screen 
                name="regulator/registration" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="regulator/reporting" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="regulator/dashboard" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />

              {/* Service Provider Screens */}
              <Stack.Screen 
                name="service-provider/registration" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="service-provider/reporting" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="service-provider/dashboard" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />

              {/* Buyer Screens */}
              <Stack.Screen 
                name="buyer/registration" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="buyer/create-order" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />
              <Stack.Screen 
                name="buyer/dashboard" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                }} 
              />

              {/* Modal Demo Screens */}
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  title: "Standard Modal",
                }}
              />
              <Stack.Screen
                name="formsheet"
                options={{
                  presentation: "formSheet",
                  title: "Form Sheet Modal",
                  sheetGrabberVisible: true,
                  sheetAllowedDetents: [0.5, 0.8, 1.0],
                  sheetCornerRadius: 20,
                }}
              />
              <Stack.Screen
                name="transparent-modal"
                options={{
                  presentation: "transparentModal",
                  headerShown: false,
                }}
              />
            </Stack>
            <SystemBars style={"auto"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </ThemeProvider>
    </>
  );
}
