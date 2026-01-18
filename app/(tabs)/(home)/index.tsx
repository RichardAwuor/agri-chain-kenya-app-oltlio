import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserType = 'producer' | 'regulator' | 'service_provider' | 'buyer' | null;

export default function HomeScreen() {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log('HomeScreen: Checking for existing user session');
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userType = await AsyncStorage.getItem('userType');
      const registrationCompleted = await AsyncStorage.getItem('registrationCompleted');
      console.log('HomeScreen: Found stored user', { userId, userType, registrationCompleted });
      
      if (userId && userType) {
        setCurrentUserId(userId);
        setSelectedUserType(userType as UserType);
        
        // Fetch latest user data from backend
        try {
          const { default: api } = await import('@/utils/api');
          const result = await api.getUser(userId);
          console.log('HomeScreen: Fetched latest user data from backend', result);
          
          // Update local storage with latest data
          await AsyncStorage.setItem('userData', JSON.stringify(result.user));
          
          // Navigate to appropriate screen based on registration status
          if (result.user.registrationCompleted || registrationCompleted === 'true') {
            // User has completed registration, navigate to main app
            if (userType === 'producer') {
              router.push('/producer/reporting');
            } else {
              navigateToUserScreen(userType as UserType, userId);
            }
          } else {
            // User hasn't completed registration, navigate to registration screen
            navigateToUserScreen(userType as UserType, userId);
          }
        } catch (error) {
          console.error('HomeScreen: Error fetching user data from backend:', error);
          // Fallback to navigation without updated data
          navigateToUserScreen(userType as UserType, userId);
        }
      }
    } catch (error) {
      console.error('HomeScreen: Error checking existing user:', error);
    }
  };

  const navigateToUserScreen = (userType: UserType, userId: string) => {
    console.log('HomeScreen: Navigating to user screen', { userType, userId });
    switch (userType) {
      case 'producer':
        router.push('/producer/registration');
        break;
      case 'regulator':
        router.push('/regulator/registration');
        break;
      case 'service_provider':
        router.push('/service-provider/registration');
        break;
      case 'buyer':
        router.push('/buyer/registration');
        break;
    }
  };

  const handleUserTypeSelect = async (userType: UserType) => {
    console.log('HomeScreen: User selected type:', userType);
    setSelectedUserType(userType);
    
    try {
      await AsyncStorage.setItem('userType', userType!);
      console.log('HomeScreen: Saved user type to storage');
      navigateToUserScreen(userType, 'new');
    } catch (error) {
      console.error('HomeScreen: Error saving user type:', error);
    }
  };

  const userTypes = [
    {
      type: 'producer' as UserType,
      title: 'Producer',
      description: 'Register your farm and report agricultural activities',
      icon: 'agriculture',
      color: '#2E7D32',
    },
    {
      type: 'regulator' as UserType,
      title: 'Regulator',
      description: 'Monitor farms and ensure compliance',
      icon: 'verified',
      color: '#1976D2',
    },
    {
      type: 'service_provider' as UserType,
      title: 'Service Provider',
      description: 'Provide agricultural services to farmers',
      icon: 'build',
      color: '#F57C00',
    },
    {
      type: 'buyer' as UserType,
      title: 'Buyer',
      description: 'Create orders and purchase agricultural products',
      icon: 'shopping-cart',
      color: '#7B1FA2',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/7bda0412-f420-4692-bde4-caf98ff36e25/assets/images/c9f89323-d01b-43ca-9fd4-6755e767fcab.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>PLUS-Kenya</Text>
          <Text style={styles.subtitle}>Agricultural Supply Chain Coordination</Text>
          <Text style={styles.tagline}>MAR 2026 • INTEGRATE</Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.selectionContainer}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <Text style={styles.sectionSubtitle}>Choose how you&apos;ll participate in the supply chain</Text>

          {userTypes.map((userType) => (
            <TouchableOpacity
              key={userType.type}
              style={[
                styles.userTypeCard,
                selectedUserType === userType.type && styles.userTypeCardSelected,
              ]}
              onPress={() => handleUserTypeSelect(userType.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: userType.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={userType.icon}
                  android_material_icon_name={userType.icon}
                  size={32}
                  color={userType.color}
                />
              </View>
              <View style={styles.userTypeContent}>
                <Text style={styles.userTypeTitle}>{userType.title}</Text>
                <Text style={styles.userTypeDescription}>{userType.description}</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by PLUS-Kenya Initiative
          </Text>
          <Text style={styles.footerSubtext}>
            Connecting farmers, regulators, and buyers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
  },
  selectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  userTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  userTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userTypeContent: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userTypeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
