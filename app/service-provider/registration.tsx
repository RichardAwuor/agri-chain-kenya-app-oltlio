
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationData {
  counties: Array<{ countyName: string; countyCode: string; countyNumber: string }>;
  subCounties: string[];
  wards: Array<{ wardName: string; wardNumber: string }>;
}

export default function ServiceProviderRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Form data
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [workIdFront, setWorkIdFront] = useState<string | null>(null);
  const [workIdBack, setWorkIdBack] = useState<string | null>(null);
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [coreMandates, setCoreMandates] = useState<string[]>([]);

  // Dropdown data
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [mandates, setMandates] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({
    counties: [],
    subCounties: [],
    wards: [],
  });

  // Dropdown visibility
  const [showOrganizationDropdown, setShowOrganizationDropdown] = useState(false);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showSubCountyDropdown, setShowSubCountyDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [showMandateDropdown, setShowMandateDropdown] = useState(false);

  useEffect(() => {
    console.log('ServiceProviderRegistration: Component mounted');
    loadDropdownData();
    loadCounties();
  }, []);

  const loadDropdownData = async () => {
    try {
      console.log('ServiceProviderRegistration: Loading dropdown data');
      const { default: api } = await import('@/utils/api');
      
      const orgsData = await api.getServiceProviderOrganizations();
      setOrganizations(orgsData);

      const mandatesData = await api.getCoreMandates();
      setMandates(mandatesData);

      console.log('ServiceProviderRegistration: Dropdown data loaded', { orgsData, mandatesData });
    } catch (error) {
      console.error('ServiceProviderRegistration: Error loading dropdown data:', error);
      // Fallback data
      setOrganizations(['Agronomist', 'Aggregator']);
      setMandates([
        'Advisory (Agronomist)',
        'Collection estimation (Agronomist/Aggregator)',
        'Collection (Aggregator)',
        'Shipment (Aggregator)',
      ]);
    }
  };

  const loadCounties = async () => {
    try {
      setLoadingLocations(true);
      console.log('ServiceProviderRegistration: Loading counties');
      const { default: api } = await import('@/utils/api');
      const result = await api.getCounties();
      
      // Add "Various" option
      const countiesWithVarious = [
        { countyName: 'Various', countyCode: 'VAR', countyNumber: '00' },
        ...result.counties,
      ];
      
      setLocationData((prev) => ({ ...prev, counties: countiesWithVarious }));
      console.log('ServiceProviderRegistration: Counties loaded', countiesWithVarious.length);
    } catch (error) {
      console.error('ServiceProviderRegistration: Error loading counties:', error);
      Alert.alert('Error', 'Failed to load counties. Please try again.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadSubCounties = async (selectedCounty: string) => {
    if (selectedCounty === 'Various') {
      setLocationData((prev) => ({ ...prev, subCounties: ['Various'] }));
      return;
    }

    try {
      setLoadingLocations(true);
      console.log('ServiceProviderRegistration: Loading sub-counties for', selectedCounty);
      const { default: api } = await import('@/utils/api');
      const result = await api.getSubCounties(selectedCounty);
      
      // Add "Various" option
      const subCountiesWithVarious = ['Various', ...result.subCounties];
      
      setLocationData((prev) => ({ ...prev, subCounties: subCountiesWithVarious }));
      console.log('ServiceProviderRegistration: Sub-counties loaded', subCountiesWithVarious.length);
    } catch (error) {
      console.error('ServiceProviderRegistration: Error loading sub-counties:', error);
      Alert.alert('Error', 'Failed to load sub-counties. Please try again.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadWards = async (selectedCounty: string, selectedSubCounty: string) => {
    if (selectedCounty === 'Various' || selectedSubCounty === 'Various') {
      setLocationData((prev) => ({ ...prev, wards: [{ wardName: 'Various', wardNumber: '00' }] }));
      return;
    }

    try {
      setLoadingLocations(true);
      console.log('ServiceProviderRegistration: Loading wards for', { selectedCounty, selectedSubCounty });
      const { default: api } = await import('@/utils/api');
      const result = await api.getWards(selectedCounty, selectedSubCounty);
      
      // Add "Various" option
      const wardsWithVarious = [
        { wardName: 'Various', wardNumber: '00' },
        ...result.wards,
      ];
      
      setLocationData((prev) => ({ ...prev, wards: wardsWithVarious }));
      console.log('ServiceProviderRegistration: Wards loaded', wardsWithVarious.length);
    } catch (error) {
      console.error('ServiceProviderRegistration: Error loading wards:', error);
      Alert.alert('Error', 'Failed to load wards. Please try again.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleCountySelect = (selectedCounty: { countyName: string; countyCode: string; countyNumber: string }) => {
    console.log('ServiceProviderRegistration: County selected', selectedCounty);
    setCounty(selectedCounty.countyName);
    setSubCounty('');
    setWard('');
    setShowCountyDropdown(false);
    loadSubCounties(selectedCounty.countyName);
  };

  const handleSubCountySelect = (selectedSubCounty: string) => {
    console.log('ServiceProviderRegistration: Sub-county selected', selectedSubCounty);
    setSubCounty(selectedSubCounty);
    setWard('');
    setShowSubCountyDropdown(false);
    loadWards(county, selectedSubCounty);
  };

  const handleWardSelect = (selectedWard: { wardName: string; wardNumber: string }) => {
    console.log('ServiceProviderRegistration: Ward selected', selectedWard);
    setWard(selectedWard.wardName);
    setShowWardDropdown(false);
  };

  const toggleMandate = (mandate: string) => {
    console.log('ServiceProviderRegistration: Toggling mandate', mandate);
    if (coreMandates.includes(mandate)) {
      setCoreMandates(coreMandates.filter((m) => m !== mandate));
    } else {
      setCoreMandates([...coreMandates, mandate]);
    }
  };

  const pickImage = async (type: 'front' | 'back') => {
    console.log('ServiceProviderRegistration: Picking image for', type);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'front') {
        setWorkIdFront(result.assets[0].uri);
      } else {
        setWorkIdBack(result.assets[0].uri);
      }
      console.log('ServiceProviderRegistration: Image selected', type);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for free email domains
    const freeEmailDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
      'icloud.com',
      'mail.com',
      'protonmail.com',
      'zoho.com',
    ];
    const domain = email.split('@')[1].toLowerCase();
    return !freeEmailDomains.includes(domain);
  };

  const validateStep1 = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your work email');
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please use a paid work email domain (not gmail, yahoo, etc.)');
      return false;
    }
    if (email !== confirmEmail) {
      Alert.alert('Validation Error', 'Emails do not match');
      return false;
    }
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first and last name');
      return false;
    }
    if (!organizationName) {
      Alert.alert('Validation Error', 'Please select an organization');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!workIdFront || !workIdBack) {
      Alert.alert('Validation Error', 'Please upload both front and back of your work ID');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!county || !subCounty || !ward) {
      Alert.alert('Validation Error', 'Please select county, sub-county, and ward');
      return false;
    }
    if (coreMandates.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one core mandate');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    console.log('ServiceProviderRegistration: Moving to next step', step);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    console.log('ServiceProviderRegistration: Moving to previous step', step);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('ServiceProviderRegistration: Submitting registration');
    setLoading(true);

    try {
      const { BACKEND_URL } = await import('@/utils/api');
      
      // First, upload work ID images if they exist
      let workIdFrontUrl = workIdFront;
      let workIdBackUrl = workIdBack;

      if (workIdFront && workIdFront.startsWith('file://')) {
        console.log('ServiceProviderRegistration: Uploading front work ID');
        const formData = new FormData();
        formData.append('image', {
          uri: workIdFront,
          type: 'image/jpeg',
          name: 'work-id-front.jpg',
        } as any);

        const uploadResponse = await fetch(`${BACKEND_URL}/api/upload/work-id`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        workIdFrontUrl = uploadData.url;
        console.log('ServiceProviderRegistration: Front work ID uploaded', workIdFrontUrl);
      }

      if (workIdBack && workIdBack.startsWith('file://')) {
        console.log('ServiceProviderRegistration: Uploading back work ID');
        const formData = new FormData();
        formData.append('image', {
          uri: workIdBack,
          type: 'image/jpeg',
          name: 'work-id-back.jpg',
        } as any);

        const uploadResponse = await fetch(`${BACKEND_URL}/api/upload/work-id`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        workIdBackUrl = uploadData.url;
        console.log('ServiceProviderRegistration: Back work ID uploaded', workIdBackUrl);
      }

      // Register service provider
      const registrationData = {
        email,
        confirmEmail: email, // Same as email since we already validated
        firstName,
        lastName,
        organizationName,
        workIdFrontUrl,
        workIdBackUrl,
        county,
        subCounty,
        ward,
        coreMandates,
      };

      console.log('ServiceProviderRegistration: Registering service provider', registrationData);
      const response = await fetch(`${BACKEND_URL}/api/service-providers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();

      // Save to AsyncStorage
      await AsyncStorage.setItem('userId', result.id);
      await AsyncStorage.setItem('userType', 'service_provider');
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        organizationName: result.organizationName,
        county,
        subCounty,
        ward,
        coreMandates,
      }));
      await AsyncStorage.setItem('registrationCompleted', 'true');

      console.log('ServiceProviderRegistration: Registration successful', result.id);
      Alert.alert('Success', 'Registration completed successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/service-provider/dashboard'),
        },
      ]);
    } catch (error: any) {
      console.error('ServiceProviderRegistration: Registration failed:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <Text style={styles.label}>Work Email *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="your.name@company.com"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Re-enter Email *</Text>
      <TextInput
        style={styles.input}
        value={confirmEmail}
        onChangeText={setConfirmEmail}
        placeholder="Confirm your email"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Last Name *</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Organization Name *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowOrganizationDropdown(!showOrganizationDropdown)}
      >
        <Text style={organizationName ? styles.dropdownText : styles.dropdownPlaceholder}>
          {organizationName || 'Select organization'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showOrganizationDropdown && (
        <View style={styles.dropdownList}>
          {organizations.map((org) => (
            <TouchableOpacity
              key={org}
              style={styles.dropdownItem}
              onPress={() => {
                setOrganizationName(org);
                setShowOrganizationDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{org}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Work ID Upload</Text>
      <Text style={styles.stepSubtitle}>Please upload clear photos of your work ID</Text>

      <Text style={styles.label}>Work ID - Front *</Text>
      <TouchableOpacity
        style={styles.imageUploadButton}
        onPress={() => pickImage('front')}
      >
        {workIdFront ? (
          <Image source={{ uri: workIdFront }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <IconSymbol
              ios_icon_name="camera"
              android_material_icon_name="camera"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.uploadText}>Tap to upload front</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Work ID - Back *</Text>
      <TouchableOpacity
        style={styles.imageUploadButton}
        onPress={() => pickImage('back')}
      >
        {workIdBack ? (
          <Image source={{ uri: workIdBack }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <IconSymbol
              ios_icon_name="camera"
              android_material_icon_name="camera"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.uploadText}>Tap to upload back</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location & Mandate</Text>

      <Text style={styles.label}>County *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowCountyDropdown(!showCountyDropdown)}
      >
        <Text style={county ? styles.dropdownText : styles.dropdownPlaceholder}>
          {county || 'Select county'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showCountyDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {locationData.counties.map((c) => (
            <TouchableOpacity
              key={c.countyCode}
              style={styles.dropdownItem}
              onPress={() => handleCountySelect(c)}
            >
              <Text style={styles.dropdownItemText}>{c.countyName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {county && (
        <>
          <Text style={styles.label}>Sub-County *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSubCountyDropdown(!showSubCountyDropdown)}
          >
            <Text style={subCounty ? styles.dropdownText : styles.dropdownPlaceholder}>
              {subCounty || 'Select sub-county'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showSubCountyDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {locationData.subCounties.map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={styles.dropdownItem}
                  onPress={() => handleSubCountySelect(sc)}
                >
                  <Text style={styles.dropdownItemText}>{sc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {subCounty && (
        <>
          <Text style={styles.label}>Ward *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowWardDropdown(!showWardDropdown)}
          >
            <Text style={ward ? styles.dropdownText : styles.dropdownPlaceholder}>
              {ward || 'Select ward'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showWardDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {locationData.wards.map((w) => (
                <TouchableOpacity
                  key={w.wardNumber}
                  style={styles.dropdownItem}
                  onPress={() => handleWardSelect(w)}
                >
                  <Text style={styles.dropdownItemText}>{w.wardName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Text style={styles.label}>Core Mandate * (Select multiple)</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowMandateDropdown(!showMandateDropdown)}
      >
        <Text style={coreMandates.length > 0 ? styles.dropdownText : styles.dropdownPlaceholder}>
          {coreMandates.length > 0 ? `${coreMandates.length} selected` : 'Select mandates'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showMandateDropdown && (
        <View style={styles.dropdownList}>
          {mandates.map((mandate) => (
            <TouchableOpacity
              key={mandate}
              style={styles.checkboxItem}
              onPress={() => toggleMandate(mandate)}
            >
              <View style={styles.checkbox}>
                {coreMandates.includes(mandate) && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </View>
              <Text style={styles.checkboxText}>{mandate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {coreMandates.length > 0 && (
        <View style={styles.selectedMandates}>
          <Text style={styles.selectedMandatesTitle}>Selected Mandates:</Text>
          {coreMandates.map((mandate) => (
            <View key={mandate} style={styles.mandateChip}>
              <Text style={styles.mandateChipText}>{mandate}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Service Provider Registration',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.card,
        }}
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s === step && styles.progressDotActive,
              s < step && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, step === 1 && styles.buttonFull]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              {step === 3 ? 'Complete Registration' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 32,
  },
  progressDotCompleted: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dropdownList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectedMandates: {
    marginTop: 8,
  },
  selectedMandatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  mandateChip: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  mandateChipText: {
    fontSize: 14,
    color: colors.primary,
  },
  imageUploadButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
