
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

interface USState {
  id: string;
  stateName: string;
  stateCode: string;
}

interface USCity {
  id: string;
  cityName: string;
  stateCode: string;
}

interface USZipCode {
  id: string;
  zipCode: string;
  cityName: string;
  stateCode: string;
}

interface USAirport {
  id: string;
  airportName: string;
  airportCode: string;
  city: string;
  stateCode: string;
}

export default function BuyerRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [workIdFront, setWorkIdFront] = useState<string | null>(null);
  const [workIdBack, setWorkIdBack] = useState<string | null>(null);
  const [mainOfficeAddress, setMainOfficeAddress] = useState('');
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [selectedCity, setSelectedCity] = useState<USCity | null>(null);
  const [selectedZipCode, setSelectedZipCode] = useState<USZipCode | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<USAirport | null>(null);

  // Manual input fields for city and zip code (placeholders)
  const [manualCity, setManualCity] = useState('');
  const [manualZipCode, setManualZipCode] = useState('');

  // Email validation states
  const [emailValid, setEmailValid] = useState(false);
  const [confirmEmailValid, setConfirmEmailValid] = useState(false);

  // Dropdown data
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [usStates, setUsStates] = useState<USState[]>([]);
  const [usCities, setUsCities] = useState<USCity[]>([]);
  const [usZipCodes, setUsZipCodes] = useState<USZipCode[]>([]);
  const [usAirports, setUsAirports] = useState<USAirport[]>([]);

  // Dropdown visibility
  const [showOrganizationDropdown, setShowOrganizationDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showZipCodeDropdown, setShowZipCodeDropdown] = useState(false);
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);

  // Loading states for cascading dropdowns
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZipCodes, setLoadingZipCodes] = useState(false);

  useEffect(() => {
    console.log('BuyerRegistration: Component mounted');
    loadDropdownData();
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedState) {
      console.log('BuyerRegistration: Loading cities for state', selectedState.stateCode);
      loadCitiesForState(selectedState.stateCode);
      // Reset city and zip code when state changes
      setSelectedCity(null);
      setSelectedZipCode(null);
      setManualCity('');
      setManualZipCode('');
      setUsCities([]);
      setUsZipCodes([]);
    }
  }, [selectedState]);

  // Load zip codes when city is selected
  useEffect(() => {
    if (selectedCity && selectedState) {
      console.log('BuyerRegistration: Loading zip codes for city', selectedCity.cityName);
      loadZipCodesForCity(selectedCity.cityName, selectedState.stateCode);
      // Reset zip code when city changes
      setSelectedZipCode(null);
      setManualZipCode('');
      setUsZipCodes([]);
    }
  }, [selectedCity]);

  // Validate email in real-time
  useEffect(() => {
    if (email.trim()) {
      const isValid = validateEmail(email);
      setEmailValid(isValid);
      console.log('BuyerRegistration: Email validation', { email, isValid });
    } else {
      setEmailValid(false);
    }
  }, [email]);

  // Validate confirm email in real-time
  useEffect(() => {
    if (confirmEmail.trim()) {
      const isValid = email === confirmEmail && validateEmail(confirmEmail);
      setConfirmEmailValid(isValid);
      console.log('BuyerRegistration: Confirm email validation', { confirmEmail, isValid });
    } else {
      setConfirmEmailValid(false);
    }
  }, [confirmEmail, email]);

  const loadDropdownData = async () => {
    try {
      console.log('BuyerRegistration: Loading dropdown data');
      const { default: api } = await import('@/utils/api');
      
      // Load organizations
      const orgsData = await api.getBuyerOrganizations();
      setOrganizations(orgsData);

      // Load US states
      const statesData = await api.getUSStates();
      setUsStates(statesData);

      // Load US airports
      const airportsData = await api.getUSAirports();
      setUsAirports(airportsData);

      console.log('BuyerRegistration: Dropdown data loaded', { 
        orgsCount: orgsData.length,
        statesCount: statesData.length,
        airportsCount: airportsData.length 
      });
    } catch (error) {
      console.error('BuyerRegistration: Error loading dropdown data:', error);
      // Fallback data
      setOrganizations([
        'Costco wholesale',
        'Walmart',
        'Whole Foods Market',
        'The Kroger Co.',
        'Sprouts Farmers Market',
        "Trader Joe's",
        'Albertsons Co.',
        'Target',
        'Publix Super Markets',
        'ALDI',
      ]);
    }
  };

  const loadCitiesForState = async (stateCode: string) => {
    setLoadingCities(true);
    try {
      console.log('BuyerRegistration: Fetching cities for state', stateCode);
      const { default: api } = await import('@/utils/api');
      const citiesData = await api.getUSCities(stateCode);
      setUsCities(citiesData);
      console.log('BuyerRegistration: Cities loaded', citiesData.length);
    } catch (error) {
      console.error('BuyerRegistration: Error loading cities:', error);
      Alert.alert('Info', 'Cities data not available. You can enter the city name manually.');
    } finally {
      setLoadingCities(false);
    }
  };

  const loadZipCodesForCity = async (cityName: string, stateCode: string) => {
    setLoadingZipCodes(true);
    try {
      console.log('BuyerRegistration: Fetching zip codes for city', cityName, stateCode);
      const { default: api } = await import('@/utils/api');
      const zipCodesData = await api.getUSZipCodes(cityName, stateCode);
      setUsZipCodes(zipCodesData);
      console.log('BuyerRegistration: Zip codes loaded', zipCodesData.length);
    } catch (error) {
      console.error('BuyerRegistration: Error loading zip codes:', error);
      Alert.alert('Info', 'Zip codes data not available. You can enter the zip code manually.');
    } finally {
      setLoadingZipCodes(false);
    }
  };

  const pickImage = async (type: 'front' | 'back') => {
    console.log('BuyerRegistration: Picking image for', type);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      console.log('BuyerRegistration: Image selected', type);
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
    if (!mainOfficeAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter the main office address');
      return false;
    }
    if (!selectedState) {
      Alert.alert('Validation Error', 'Please select a state');
      return false;
    }
    // Check if city is provided (either from dropdown or manual input)
    if (!selectedCity && !manualCity.trim()) {
      Alert.alert('Validation Error', 'Please select or enter a city');
      return false;
    }
    // Check if zip code is provided (either from dropdown or manual input)
    if (!selectedZipCode && !manualZipCode.trim()) {
      Alert.alert('Validation Error', 'Please select or enter a zip code');
      return false;
    }
    if (!selectedAirport) {
      Alert.alert('Validation Error', 'Please select a delivery airport');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    console.log('BuyerRegistration: Moving to next step', step);
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
    console.log('BuyerRegistration: Moving to previous step', step);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('BuyerRegistration: Submitting registration');
    setLoading(true);

    try {
      const { BACKEND_URL } = await import('@/utils/api');
      
      // Use manual input if dropdown selection is not available
      const finalCity = selectedCity?.cityName || manualCity;
      const finalZipCode = selectedZipCode?.zipCode || manualZipCode;

      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('email', email);
      formData.append('confirmEmail', email);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('organizationName', organizationName);
      formData.append('mainOfficeAddress', mainOfficeAddress);
      formData.append('officeState', selectedState?.stateName || '');
      formData.append('officeCity', finalCity);
      formData.append('officeZipCode', finalZipCode);
      formData.append('deliveryAirport', selectedAirport ? `${selectedAirport.airportName} (${selectedAirport.airportCode})` : '');

      // Add work ID images
      if (workIdFront) {
        console.log('BuyerRegistration: Adding front work ID to form data');
        formData.append('workIdFront', {
          uri: workIdFront,
          type: 'image/jpeg',
          name: 'work-id-front.jpg',
        } as any);
      }

      if (workIdBack) {
        console.log('BuyerRegistration: Adding back work ID to form data');
        formData.append('workIdBack', {
          uri: workIdBack,
          type: 'image/jpeg',
          name: 'work-id-back.jpg',
        } as any);
      }

      console.log('BuyerRegistration: Submitting buyer registration as multipart/form-data');
      const response = await fetch(`${BACKEND_URL}/api/buyers/register`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser/fetch set it with the boundary
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BuyerRegistration: Registration failed with status', response.status, errorText);
        throw new Error(errorText || 'Registration failed');
      }

      const result = await response.json();

      // Save to AsyncStorage
      await AsyncStorage.setItem('userId', result.id);
      await AsyncStorage.setItem('userType', 'buyer');
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        organizationName: result.organizationName,
        mainOfficeAddress,
        officeState: selectedState?.stateName || '',
        officeCity: finalCity,
        officeZipCode: finalZipCode,
        deliveryAirport: selectedAirport ? `${selectedAirport.airportName} (${selectedAirport.airportCode})` : '',
      }));
      await AsyncStorage.setItem('registrationCompleted', 'true');

      console.log('BuyerRegistration: Registration successful, navigating to dashboard', result.id);
      Alert.alert('Success', 'Registration completed successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/buyer/dashboard'),
        },
      ]);
    } catch (error: any) {
      console.error('BuyerRegistration: Registration failed:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
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
          placeholder="your.name@company.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
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

      <Text style={styles.label}>Re-enter Email *</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          style={[styles.input, styles.inputWithCheckmark]}
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          placeholder="Confirm your email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {organizations.map((org, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                console.log('BuyerRegistration: Organization selected', org);
                setOrganizationName(org);
                setShowOrganizationDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{org}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      <Text style={styles.stepTitle}>Office Address & Delivery</Text>

      <Text style={styles.label}>Main Office Address *</Text>
      <TextInput
        style={styles.input}
        value={mainOfficeAddress}
        onChangeText={setMainOfficeAddress}
        placeholder="Enter street address"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>State *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowStateDropdown(!showStateDropdown)}
      >
        <Text style={selectedState ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedState ? `${selectedState.stateName} (${selectedState.stateCode})` : 'Select state'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showStateDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {usStates.map((state) => (
            <TouchableOpacity
              key={state.id}
              style={styles.dropdownItem}
              onPress={() => {
                console.log('BuyerRegistration: State selected', state.stateName);
                setSelectedState(state);
                setShowStateDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {state.stateName} ({state.stateCode})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>City *</Text>
      {usCities.length > 0 ? (
        <React.Fragment>
          <TouchableOpacity
            style={[styles.dropdown, !selectedState && styles.dropdownDisabled]}
            onPress={() => {
              if (selectedState) {
                setShowCityDropdown(!showCityDropdown);
              } else {
                Alert.alert('Info', 'Please select a state first');
              }
            }}
            disabled={!selectedState}
          >
            <Text style={selectedCity ? styles.dropdownText : styles.dropdownPlaceholder}>
              {loadingCities ? 'Loading cities...' : (selectedCity ? selectedCity.cityName : 'Select city')}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showCityDropdown && !loadingCities && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {usCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    console.log('BuyerRegistration: City selected', city.cityName);
                    setSelectedCity(city);
                    setManualCity('');
                    setShowCityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city.cityName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </React.Fragment>
      ) : (
        <TextInput
          style={styles.input}
          value={manualCity}
          onChangeText={setManualCity}
          placeholder="Enter city name (e.g., Los Angeles, New York)"
          placeholderTextColor={colors.textSecondary}
          editable={!!selectedState}
        />
      )}

      <Text style={styles.label}>Zip Code *</Text>
      {usZipCodes.length > 0 ? (
        <React.Fragment>
          <TouchableOpacity
            style={[styles.dropdown, !selectedCity && !manualCity && styles.dropdownDisabled]}
            onPress={() => {
              if (selectedCity || manualCity) {
                setShowZipCodeDropdown(!showZipCodeDropdown);
              } else {
                Alert.alert('Info', 'Please select or enter a city first');
              }
            }}
            disabled={!selectedCity && !manualCity}
          >
            <Text style={selectedZipCode ? styles.dropdownText : styles.dropdownPlaceholder}>
              {loadingZipCodes ? 'Loading zip codes...' : (selectedZipCode ? selectedZipCode.zipCode : 'Select zip code')}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showZipCodeDropdown && !loadingZipCodes && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {usZipCodes.map((zipCode) => (
                <TouchableOpacity
                  key={zipCode.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    console.log('BuyerRegistration: Zip code selected', zipCode.zipCode);
                    setSelectedZipCode(zipCode);
                    setManualZipCode('');
                    setShowZipCodeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{zipCode.zipCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </React.Fragment>
      ) : (
        <TextInput
          style={styles.input}
          value={manualZipCode}
          onChangeText={setManualZipCode}
          placeholder="Enter zip code (e.g., 90001, 10001)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          editable={!!selectedState}
        />
      )}

      <Text style={styles.label}>Delivery Airport *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowAirportDropdown(!showAirportDropdown)}
      >
        <Text style={selectedAirport ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedAirport 
            ? `${selectedAirport.airportName} (${selectedAirport.airportCode})` 
            : 'Select delivery airport'}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="arrow-drop-down"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showAirportDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {usAirports.map((airport) => (
            <TouchableOpacity
              key={airport.id}
              style={styles.dropdownItem}
              onPress={() => {
                console.log('BuyerRegistration: Airport selected', airport.airportName);
                setSelectedAirport(airport);
                setShowAirportDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {airport.airportName} ({airport.airportCode})
                {airport.city && ` - ${airport.city}, ${airport.stateCode}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Buyer Registration',
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
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
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
