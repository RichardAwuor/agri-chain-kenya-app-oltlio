
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { PLUS_KENYA_BRANDING } from '@/constants/PlusKenyaBranding';

export default function WelcomeScreen() {
  console.log('WelcomeScreen: Rendering welcome screen');

  const handleGetStarted = () => {
    console.log('WelcomeScreen: User tapped Get Started button');
    router.replace('/(tabs)/(home)/');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/4a9be70d-36d3-48c4-b3c2-ab04c026b5a9.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>PLUS-Kenya</Text>

      {/* Slogan */}
      <Text style={styles.slogan}>{PLUS_KENYA_BRANDING.slogan}</Text>

      {/* Flag Colors Divider */}
      <View style={styles.flagColors}>
        <View style={[styles.flagStripe, { backgroundColor: PLUS_KENYA_BRANDING.colors.black }]} />
        <View style={[styles.flagStripe, { backgroundColor: PLUS_KENYA_BRANDING.colors.red }]} />
        <View style={[styles.flagStripe, { backgroundColor: PLUS_KENYA_BRANDING.colors.green }]} />
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to PLUS-Kenya</Text>

      {/* Description */}
      <Text style={styles.description}>
        Coordinating agricultural supply chains across Kenya
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity 
        style={styles.getStartedButton}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.getStartedButtonText}>Get Started</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Connecting Producers, Regulators, Service Providers, and Buyers
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: colors.kenyaGreen,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  flagColors: {
    flexDirection: 'row',
    width: 240,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  flagStripe: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: colors.kenyaGreen,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 32,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  getStartedButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
