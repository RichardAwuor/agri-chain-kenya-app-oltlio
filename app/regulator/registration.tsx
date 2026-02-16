
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { Stack, router } from 'expo-router';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';

interface LocationData {
  counties: { countyName: string; countyCode: string; countyNumber: string }[];
  subCounties: { subCounty: string; subCountyNumber: string }[];
  wards: { wardName: string; wardNumber: string }[];
}

const ORGANIZATION_OPTIONS = [
  'Government Agency',
  'Supporting NGO',
  'Buyer Agency',
];

const MANDATE_OPTIONS = [
  'Compliance',
  'Productivity uplift',
  'Media/Reporting',
  'Various',
];

export default function RegulatorRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1: Email and Personal Info
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  // Email validation states
  const [emailValid, setEmailValid] = useState(false);
  const [confirmEmailValid, setConfirmEmailValid] = useState(false);

  // Step 2: Location and Mandate
  const [locationData, setLocationData] = useState<LocationData>({
    counties: [],
    subCounties: [],
    wards: [],
  });
  const [selectedCounty, setSelectedCounty] = useState<{
    countyName: string;
    countyCode: string;
    countyNumber: string;
  } | null>(null);
  const [selectedSubCounty, setSelectedSubCounty] = useState('');
  const [selectedWard, setSelectedWard] = useState<{
    wardName: string;
    wardNumber: string;
  } | null>(null);
  const [selectedMandates, setSelectedMandates] = useState<string[]>([]);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showSubCountyDropdown, setShowSubCountyDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  const loadDropdownData = useCallback(async () => {
    console.log('RegulatorRegistration: Loading dropdown data');
    try {
      await loadCounties();
      setLoadingData(false);
    } catch (error) {
      console.error('RegulatorRegistration: Error loading dropdown data:', error);
      Alert.alert('Error', 'Failed to load location data. Please try again.');
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    console.log('RegulatorRegistration: Component mounted');
    loadDropdownData();
  }, [loadDropdownData]);

  // Validate email in real-time
  useEffect(() => {
    if (email.trim()) {
      const isValid = validateEmail(email);
      setEmailValid(isValid);
    } else {
      setEmailValid(false);
    }
  }, [email]);

  // Validate confirm email in real-time
  useEffect(() => {
    if (confirmEmail.trim()) {
      const isValid = email === confirmEmail && validateEmail(confirmEmail);
      setConfirmEmailValid(isValid);
    } else {
      setConfirmEmailValid(false);
    }
  }, [confirmEmail, email]);



  const loadCounties = async () => {
    try {
      const counties = await api.getCounties();
      
      // Add "Various" option
      const countiesWithVarious = [
        ...counties,
        { countyName: 'Various', countyCode: 'VAR', countyNumber: '00' }
      ];
      
      setLocationData((prev) => ({ ...prev, counties: countiesWithVarious }));
      console.log('RegulatorRegistration: Loaded counties:', countiesWithVarious.length);
    } catch (error) {
      console.error('RegulatorRegistration: Error loading counties:', error);
      throw error;
    }
  };

  const loadSubCounties = async (county: string) => {
    if (county === 'Various') {
      setLocationData((prev) => ({ ...prev, subCounties: [{ subCounty: 'Various', subCountyNumber: '00' }] }));
      return;
    }
    
    try {
      const subCounties = await api.getSubCounties(county);
      
      // Add "Various" option
      const subCountiesWithVarious = [...subCounties, { subCounty: 'Various', subCountyNumber: '00' }];
      
      setLocationData((prev) => ({ ...prev, subCounties: subCountiesWithVarious }));
      console.log('RegulatorRegistration: Loaded sub-counties for', county, '(alphabetically ordered with numbers):', subCountiesWithVarious.length);
    } catch (error) {
      console.error('RegulatorRegistration: Error loading sub-counties:', error);
      setLocationData((prev) => ({ ...prev, subCounties: [{ subCounty: 'Various', subCountyNumber: '00' }] }));
    }
  };

  const loadWards = async (county: string, subCounty: string) => {
    if (county === 'Various' || subCounty === 'Various') {
      setLocationData((prev) => ({ 
        ...prev, 
        wards: [{ wardName: 'Various', wardNumber: '00' }] 
      }));
      return;
    }
    
    try {
      const wards = await api.getWards(county, subCounty);
      
      // Add "Various" option
      const wardsWithVarious = [
        ...wards,
        { wardName: 'Various', wardNumber: '00' }
      ];
      
      setLocationData((prev) => ({ ...prev, wards: wardsWithVarious }));
      console.log('RegulatorRegistration: Loaded wards for', county, subCounty, ':', wardsWithVarious.length);
    } catch (error) {
      console.error('RegulatorRegistration: Error loading wards:', error);
      setLocationData((prev) => ({ 
        ...prev, 
        wards: [{ wardName: 'Various', wardNumber: '00' }] 
      }));
    }
  };

  const handleCountySelect = (county: { countyName: string; countyCode: string; countyNumber: string }) => {
    console.log('RegulatorRegistration: County selected:', county.countyName);
    setSelectedCounty(county);
    setSelectedSubCounty('');
    setSelectedWard(null);
    setShowCountyDropdown(false);
    loadSubCounties(county.countyName);
  };

  const handleSubCountySelect = (subCountyItem: { subCounty: string; subCountyNumber: string }) => {
    console.log('RegulatorRegistration: Sub-county selected:', subCountyItem.subCounty, 'Number:', subCountyItem.subCountyNumber);
    setSelectedSubCounty(subCountyItem.subCounty);
    setSelectedWard(null);
    setShowSubCountyDropdown(false);
    if (selectedCounty) {
      loadWards(selectedCounty.countyName, subCountyItem.subCounty);
    }
  };

  const handleWardSelect = (ward: { wardName: string; wardNumber: string }) => {
    console.log('RegulatorRegistration: Ward selected:', ward.wardName);
    setSelectedWard(ward);
    setShowWardDropdown(false);
  };

  const toggleMandate = (mandate: string) => {
    console.log('RegulatorRegistration: Toggling mandate:', mandate);
    setSelectedMandates((prev) => {
      if (prev.includes(mandate)) {
        return prev.filter((m) => m !== mandate);
      } else {
        return [...prev, mandate];
      }
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your work email');
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!confirmEmail.trim()) {
      Alert.alert('Validation Error', 'Please confirm your email');
      return false;
    }
    if (email !== confirmEmail) {
      Alert.alert('Validation Error', 'Email addresses do not match');
      return false;
    }
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }
    if (!organizationName) {
      Alert.alert('Validation Error', 'Please select your organization');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!selectedCounty) {
      Alert.alert('Validation Error', 'Please select a county');
      return false;
    }
    if (!selectedSubCounty) {
      Alert.alert('Validation Error', 'Please select a sub-county');
      return false;
    }
    if (!selectedWard) {
      Alert.alert('Validation Error', 'Please select a ward');
      return false;
    }
    if (selectedMandates.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one core mandate');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    console.log('RegulatorRegistration: Moving to next step from', step);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    console.log('RegulatorRegistration: Moving back from step', step);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('RegulatorRegistration: Submitting registration');
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(api.registerRegulator(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmEmail,
          firstName,
          lastName,
          organizationName,
          county: selectedCounty!.countyName,
          subCounty: selectedSubCounty,
          ward: selectedWard!.wardName,
          coreMandates: selectedMandates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('RegulatorRegistration: Registration successful, user ID:', data.id);

      // Store user data
      await AsyncStorage.setItem('userId', data.id);
      await AsyncStorage.setItem('userType', 'regulator');
      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          id: data.id,
          userType: 'regulator',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationName: data.organizationName,
          county: selectedCounty!.countyName,
          subCounty: selectedSubCounty,
          ward: selectedWard!.wardName,
          coreMandates: selectedMandates,
        })
      );

      Alert.alert('Success', 'Registration completed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('RegulatorRegistration: Navigating to dashboard');
            router.replace('/regulator/dashboard');
          },
        },
      ]);
    } catch (error: any) {
      console.error('RegulatorRegistration: Registration error:', error);
      Alert.alert('Error', error.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <Text style={styles.label}>Work Email *</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          style={[styles.input, styles.inputWithCheckmark]}
          value={email}
          onChangeText={setEmail}
          placeholder="your.name@organization.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {email.trim() !== '' && (
          <View style={styles.checkmarkContainer}>
            {emailValid ? (
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#4CAF50"
              />
            ) : (
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={24}
                color="#F44336"
              />
            )}
          </View>
        )}
      </View>

      <Text style={styles.label}>Confirm Email *</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          style={[styles.input, styles.inputWithCheckmark]}
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          placeholder="Re-enter your email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {confirmEmail.trim() !== '' && (
          <View style={styles.checkmarkContainer}>
            {confirmEmailValid ? (
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#4CAF50"
              />
            ) : (
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={24}
                color="#F44336"
              />
            )}
          </View>
        )}
      </View>

      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Last Name *</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Organization Name *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowOrgDropdown(!showOrgDropdown)}
      >
        <Text style={organizationName ? styles.dropdownText : styles.dropdownPlaceholder}>
          {organizationName || 'Select organization'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
      {showOrgDropdown && (
        <View style={styles.dropdownList}>
          {ORGANIZATION_OPTIONS.map((org) => (
            <TouchableOpacity
              key={org}
              style={styles.dropdownItem}
              onPress={() => {
                setOrganizationName(org);
                setShowOrgDropdown(false);
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
      <Text style={styles.stepTitle}>Location & Mandate</Text>

      <Text style={styles.label}>County *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowCountyDropdown(!showCountyDropdown)}
      >
        <Text style={selectedCounty ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedCounty?.countyName || 'Select county'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
      {showCountyDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {locationData.counties.map((county) => (
            <TouchableOpacity
              key={county.countyCode}
              style={styles.dropdownItem}
              onPress={() => handleCountySelect(county)}
            >
              <Text style={styles.dropdownItemText}>{county.countyName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedCounty && (
        <>
          <Text style={styles.label}>Sub-County *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSubCountyDropdown(!showSubCountyDropdown)}
          >
            <Text style={selectedSubCounty ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedSubCounty || 'Select sub-county'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          {showSubCountyDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {locationData.subCounties.map((subCountyItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSubCountySelect(subCountyItem)}
                >
                  <Text style={styles.dropdownItemText}>
                    {subCountyItem.subCountyNumber}. {subCountyItem.subCounty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {selectedSubCounty && (
        <>
          <Text style={styles.label}>Ward *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowWardDropdown(!showWardDropdown)}
          >
            <Text style={selectedWard ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedWard?.wardName || 'Select ward'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          {showWardDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {locationData.wards.map((ward, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleWardSelect(ward)}
                >
                  <Text style={styles.dropdownItemText}>
                    {ward.wardNumber}. {ward.wardName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Text style={styles.label}>Core Mandate * (Select all that apply)</Text>
      <View style={styles.mandateContainer}>
        {MANDATE_OPTIONS.map((mandate) => (
          <TouchableOpacity
            key={mandate}
            style={[
              styles.mandateChip,
              selectedMandates.includes(mandate) && styles.mandateChipSelected,
            ]}
            onPress={() => toggleMandate(mandate)}
          >
            <Text
              style={[
                styles.mandateChipText,
                selectedMandates.includes(mandate) && styles.mandateChipTextSelected,
              ]}
            >
              {mandate}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loadingData) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Regulator Registration',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.card,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Regulator Registration',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.card,
        }}
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {step} of 2
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 2 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={styles.submitButtonText}>Complete Registration</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputWithCheckmark: {
    paddingRight: 48,
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    bottom: 12,
    justifyContent: 'center',
  },
  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxHeight: 200,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  mandateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mandateChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mandateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mandateChipText: {
    fontSize: 14,
    color: colors.text,
  },
  mandateChipTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
