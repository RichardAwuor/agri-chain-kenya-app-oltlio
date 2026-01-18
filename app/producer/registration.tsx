
import React, { useState, useEffect } from 'react';
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
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationData {
  counties: Array<{ countyName: string; countyCode: string; countyNumber: string }>;
  subCounties: string[];
  wards: Array<{ wardName: string; wardNumber: string }>;
}

export default function ProducerRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  
  // Location data
  const [locationData, setLocationData] = useState<LocationData>({
    counties: [],
    subCounties: [],
    wards: [],
  });
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubCounty, setSelectedSubCounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLng, setAddressLng] = useState<number | null>(null);
  
  // Farm data
  const [farmAcreage, setFarmAcreage] = useState('');
  const [cropType, setCropType] = useState('');
  
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  const [showSubCountyPicker, setShowSubCountyPicker] = useState(false);
  const [showWardPicker, setShowWardPicker] = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [cropTypes, setCropTypes] = useState<string[]>([]);

  useEffect(() => {
    console.log('ProducerRegistration: Component mounted, loading counties and crop types');
    loadCounties();
    loadCropTypes();
  }, []);

  const loadCounties = async () => {
    console.log('ProducerRegistration: Loading counties from backend');
    try {
      const { default: api } = await import('@/utils/api');
      const counties = await api.getCounties();
      setLocationData(prev => ({
        ...prev,
        counties,
      }));
    } catch (error) {
      console.error('ProducerRegistration: Error loading counties:', error);
      Alert.alert('Error', 'Failed to load counties. Please try again.');
    }
  };

  const loadCropTypes = async () => {
    console.log('ProducerRegistration: Loading crop types from backend');
    try {
      const { default: api } = await import('@/utils/api');
      const types = await api.getCropTypes();
      // Filter out NONE option for producers
      setCropTypes(types.filter((crop: string) => crop !== 'NONE'));
    } catch (error) {
      console.error('ProducerRegistration: Error loading crop types:', error);
      // Fallback to default crop types
      setCropTypes(['Lettuce', 'Tomato', 'Cucumber', 'Capsicum', 'Cabbage', 'Broccoli', 'Green onion', 'Potato']);
    }
  };

  const loadSubCounties = async (county: string) => {
    console.log('ProducerRegistration: Loading sub-counties for', county);
    try {
      const { default: api } = await import('@/utils/api');
      const subCounties = await api.getSubCounties(county);
      setLocationData(prev => ({
        ...prev,
        subCounties,
      }));
    } catch (error) {
      console.error('ProducerRegistration: Error loading sub-counties:', error);
      Alert.alert('Error', 'Failed to load sub-counties. Please try again.');
    }
  };

  const loadWards = async (county: string, subCounty: string) => {
    console.log('ProducerRegistration: Loading wards for', { county, subCounty });
    try {
      const { default: api } = await import('@/utils/api');
      const wards = await api.getWards(county, subCounty);
      setLocationData(prev => ({
        ...prev,
        wards,
      }));
    } catch (error) {
      console.error('ProducerRegistration: Error loading wards:', error);
      Alert.alert('Error', 'Failed to load wards. Please try again.');
    }
  };

  const getCurrentLocation = async () => {
    console.log('ProducerRegistration: Requesting location permission');
    setLocationLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to record your farm address.');
        setLocationLoading(false);
        return;
      }

      console.log('ProducerRegistration: Getting current location');
      const location = await Location.getCurrentPositionAsync({});
      setAddressLat(location.coords.latitude);
      setAddressLng(location.coords.longitude);
      console.log('ProducerRegistration: Location captured', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      
      Alert.alert('Success', 'Location captured successfully!');
    } catch (error) {
      console.error('ProducerRegistration: Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCountySelect = (county: { countyName: string; countyCode: string; countyNumber: string }) => {
    console.log('ProducerRegistration: County selected', county);
    setSelectedCounty(county.countyName);
    setSelectedSubCounty('');
    setSelectedWard('');
    setShowCountyPicker(false);
    loadSubCounties(county.countyName);
  };

  const handleSubCountySelect = (subCounty: string) => {
    console.log('ProducerRegistration: Sub-county selected', subCounty);
    setSelectedSubCounty(subCounty);
    setSelectedWard('');
    setShowSubCountyPicker(false);
    loadWards(selectedCounty, subCounty);
  };

  const handleWardSelect = (ward: { wardName: string; wardNumber: string }) => {
    console.log('ProducerRegistration: Ward selected', ward);
    setSelectedWard(ward.wardName);
    setShowWardPicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      console.log('ProducerRegistration: Date of birth selected', selectedDate);
      setDateOfBirth(selectedDate);
    }
  };

  const validateStep1 = () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    if (!idNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your ID number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
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
    if (!addressLat || !addressLng) {
      Alert.alert('Validation Error', 'Please capture your farm location');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!farmAcreage.trim()) {
      Alert.alert('Validation Error', 'Please enter your farm acreage');
      return false;
    }
    if (!cropType) {
      Alert.alert('Validation Error', 'Please select a crop type');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    console.log('ProducerRegistration: Moving to next step from', step);
    
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    console.log('ProducerRegistration: Moving back from step', step);
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    console.log('ProducerRegistration: Submitting registration');
    setLoading(true);

    try {
      const { default: api } = await import('@/utils/api');
      
      const userData = {
        userType: 'producer',
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        idNumber,
        county: selectedCounty,
        subCounty: selectedSubCounty,
        ward: selectedWard,
        addressLat,
        addressLng,
        farmAcreage: parseFloat(farmAcreage),
        cropType,
      };
      
      console.log('ProducerRegistration: Registering user with backend', userData);
      const result = await api.registerUser(userData);
      
      // Save user ID and data to AsyncStorage
      await AsyncStorage.setItem('userId', result.user.id);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      await AsyncStorage.setItem('registrationCompleted', 'true');
      
      Alert.alert(
        'Success',
        `Registration completed successfully! Your farmer ID is: ${result.user.farmerId || 'Pending'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('ProducerRegistration: Navigating to reporting screen');
              router.replace('/producer/reporting');
            },
          },
        ]
      );
    } catch (error) {
      console.error('ProducerRegistration: Error submitting registration:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 3</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone / Mobile Wallet Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+254 XXX XXX XXX"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID Number *</Text>
        <TextInput
          style={styles.input}
          value={idNumber}
          onChangeText={setIdNumber}
          placeholder="Enter your national ID number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
        />
        <Text style={styles.helperText}>
          This will be encrypted and replaced with a 10-digit farmer ID
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location Information</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 3</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>County *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCountyPicker(!showCountyPicker)}
        >
          <Text style={[styles.selectButtonText, !selectedCounty && styles.placeholder]}>
            {selectedCounty || 'Select county'}
          </Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="arrow-drop-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {showCountyPicker && (
          <View style={styles.pickerContainer}>
            {locationData.counties.map((county) => (
              <TouchableOpacity
                key={county.countyCode}
                style={styles.pickerItem}
                onPress={() => handleCountySelect(county)}
              >
                <Text style={styles.pickerItemText}>{county.countyName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sub-County *</Text>
        <TouchableOpacity
          style={[styles.selectButton, !selectedCounty && styles.selectButtonDisabled]}
          onPress={() => selectedCounty && setShowSubCountyPicker(!showSubCountyPicker)}
          disabled={!selectedCounty}
        >
          <Text style={[styles.selectButtonText, !selectedSubCounty && styles.placeholder]}>
            {selectedSubCounty || 'Select sub-county'}
          </Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="arrow-drop-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {showSubCountyPicker && (
          <View style={styles.pickerContainer}>
            {locationData.subCounties.map((subCounty) => (
              <TouchableOpacity
                key={subCounty}
                style={styles.pickerItem}
                onPress={() => handleSubCountySelect(subCounty)}
              >
                <Text style={styles.pickerItemText}>{subCounty}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ward *</Text>
        <TouchableOpacity
          style={[styles.selectButton, !selectedSubCounty && styles.selectButtonDisabled]}
          onPress={() => selectedSubCounty && setShowWardPicker(!showWardPicker)}
          disabled={!selectedSubCounty}
        >
          <Text style={[styles.selectButtonText, !selectedWard && styles.placeholder]}>
            {selectedWard || 'Select ward'}
          </Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="arrow-drop-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {showWardPicker && (
          <View style={styles.pickerContainer}>
            {locationData.wards.map((ward) => (
              <TouchableOpacity
                key={ward.wardNumber}
                style={styles.pickerItem}
                onPress={() => handleWardSelect(ward)}
              >
                <Text style={styles.pickerItemText}>{ward.wardName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Farm Address *</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.card}
              />
              <Text style={styles.locationButtonText}>
                {addressLat && addressLng ? 'Location Captured ✓' : 'Capture Current Location'}
              </Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
        {addressLat && addressLng && (
          <Text style={styles.helperText}>
            Coordinates: {addressLat.toFixed(6)}, {addressLng.toFixed(6)}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Farm Information</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 3</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Farm Acreage *</Text>
        <TextInput
          style={styles.input}
          value={farmAcreage}
          onChangeText={setFarmAcreage}
          placeholder="Enter farm size in acres"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />
        <Text style={styles.helperText}>
          Enter the total size of your farm in acres
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crop Type *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCropPicker(!showCropPicker)}
        >
          <Text style={[styles.selectButtonText, !cropType && styles.placeholder]}>
            {cropType || 'Select crop type'}
          </Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="arrow-drop-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {showCropPicker && (
          <View style={styles.pickerContainer}>
            {cropTypes.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={styles.pickerItem}
                onPress={() => {
                  console.log('ProducerRegistration: Crop type selected', crop);
                  setCropType(crop);
                  setShowCropPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{crop}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="info.circle"
          android_material_icon_name="info"
          size={20}
          color={colors.primary}
        />
        <Text style={styles.infoText}>
          You can update your crop type before each planting season in your profile
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Producer Registration',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.card,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Render current step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  progressDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
