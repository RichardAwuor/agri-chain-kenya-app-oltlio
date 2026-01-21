
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';

interface NearbyFarmer {
  id: string;
  farmerId: string;
  firstName: string;
  lastName: string;
  distance: number;
  lat: number;
  lng: number;
}

export default function RegulatorReporting() {
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [regulatorId, setRegulatorId] = useState('');
  const [regulatorName, setRegulatorName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Visit details
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Location
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyFarmers, setNearbyFarmers] = useState<NearbyFarmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<NearbyFarmer | null>(null);
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);

  // NEW: Spacing and Standards Adherence
  const [spacingCompliant, setSpacingCompliant] = useState<boolean | null>(null);
  const [standardsAdherenceNotes, setStandardsAdherenceNotes] = useState('');

  // Photos and comments
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    console.log('RegulatorReporting: Component mounted');
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (userId && userDataStr) {
        const userData = JSON.parse(userDataStr);
        setRegulatorId(userId);
        const fullName = `${userData.firstName} ${userData.lastName}`;
        setRegulatorName(fullName);
        setOrganizationName(userData.organizationName || '');
        console.log('RegulatorReporting: Loaded user data for', fullName);
      } else {
        Alert.alert('Error', 'User data not found. Please register first.');
        router.back();
      }
    } catch (error) {
      console.error('RegulatorReporting: Error loading user data:', error);
    }
  };

  const getCurrentLocation = async () => {
    console.log('RegulatorReporting: Getting current location');
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby farmers.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(coords);
      console.log('RegulatorReporting: Current location:', coords);

      // Load nearby farmers
      await loadNearbyFarmers(coords.lat, coords.lng);
    } catch (error) {
      console.error('RegulatorReporting: Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadNearbyFarmers = async (lat: number, lng: number) => {
    console.log('RegulatorReporting: Loading nearby farmers');
    try {
      const response = await fetch(api.getNearbyFarmers(lat, lng));
      const data = await response.json();
      setNearbyFarmers(data);
      console.log('RegulatorReporting: Found', data.length, 'nearby farmers');
    } catch (error) {
      console.error('RegulatorReporting: Error loading nearby farmers:', error);
      Alert.alert('Error', 'Failed to load nearby farmers. Please try again.');
    }
  };

  const pickPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 photos per visit.');
      return;
    }

    console.log('RegulatorReporting: Picking photo');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        setUploadingPhoto(true);

        const formData = new FormData();
        formData.append('image', {
          uri,
          type: 'image/jpeg',
          name: `farm-photo-${Date.now()}.jpg`,
        } as any);

        const response = await fetch(api.uploadVisitPhoto(), {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        setPhotos([...photos, data.url]);
        console.log('RegulatorReporting: Photo uploaded:', data.url);
        setUploadingPhoto(false);
      }
    } catch (error) {
      console.error('RegulatorReporting: Error picking/uploading photo:', error);
      setUploadingPhoto(false);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    console.log('RegulatorReporting: Removing photo at index', index);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setVisitDate(selectedDate);
      console.log('RegulatorReporting: Visit date changed to', selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setVisitTime(selectedTime);
      console.log('RegulatorReporting: Visit time changed to', selectedTime);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedFarmer) {
      Alert.alert('Validation Error', 'Please select a farmer to visit');
      return false;
    }
    if (spacingCompliant === null) {
      Alert.alert('Validation Error', 'Please indicate if spacing is compliant');
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one farm photo for standards adherence');
      return false;
    }
    if (!standardsAdherenceNotes.trim()) {
      Alert.alert('Validation Error', 'Please add standards adherence notes');
      return false;
    }
    if (standardsAdherenceNotes.length > 160) {
      Alert.alert('Validation Error', 'Standards adherence notes must be 160 characters or less');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('RegulatorReporting: Submitting visit report');
    if (!validateForm() || !currentLocation) {
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const visitDateTime = new Date(visitDate);
      visitDateTime.setHours(visitTime.getHours());
      visitDateTime.setMinutes(visitTime.getMinutes());

      const response = await fetch(api.createRegulatorVisit(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regulatorId,
          producerId: selectedFarmer!.id,
          visitDate: visitDateTime.toISOString(),
          visitLat: currentLocation.lat,
          visitLng: currentLocation.lng,
          spacingCompliant,
          standardsAdherenceNotes: standardsAdherenceNotes.substring(0, 160),
          comments: comments.substring(0, 160),
          photoUrls: photos,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit visit report');
      }

      console.log('RegulatorReporting: Visit report submitted successfully');

      Alert.alert('Success', 'Visit report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedFarmer(null);
            setSpacingCompliant(null);
            setStandardsAdherenceNotes('');
            setPhotos([]);
            setComments('');
            setVisitDate(new Date());
            setVisitTime(new Date());
          },
        },
      ]);
    } catch (error: any) {
      console.error('RegulatorReporting: Error submitting visit report:', error);
      Alert.alert('Error', error.message || 'Failed to submit visit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const yesButtonStyle = spacingCompliant === true ? styles.checkboxButtonSelected : styles.checkboxButton;
  const noButtonStyle = spacingCompliant === false ? styles.checkboxButtonSelected : styles.checkboxButton;
  const yesTextStyle = spacingCompliant === true ? styles.checkboxButtonTextSelected : styles.checkboxButtonText;
  const noTextStyle = spacingCompliant === false ? styles.checkboxButtonTextSelected : styles.checkboxButtonText;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Regulator Reporting',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.card,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Visit Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.dateButtonText}>
              {visitDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Visit Time *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="access-time"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.dateButtonText}>
              {visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={visitTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Selection</Text>
          
          {loadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : currentLocation ? (
            <>
              <View style={styles.locationInfo}>
                <IconSymbol
                  ios_icon_name="location"
                  android_material_icon_name="location-on"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.locationText}>
                  Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </Text>
              </View>

              <Text style={styles.label}>Select Farmer * (Based on proximity)</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowFarmerDropdown(!showFarmerDropdown)}
              >
                <Text style={selectedFarmer ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {selectedFarmer
                    ? `${selectedFarmer.farmerId} - ${selectedFarmer.firstName} ${selectedFarmer.lastName} (${selectedFarmer.distance.toFixed(2)} km)`
                    : 'Select nearby farmer'}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="arrow-drop-down"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              {showFarmerDropdown && (
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {nearbyFarmers.length > 0 ? (
                    nearbyFarmers.map((farmer) => (
                      <TouchableOpacity
                        key={farmer.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedFarmer(farmer);
                          setShowFarmerDropdown(false);
                        }}
                      >
                        <Text style={styles.farmerIdText}>{farmer.farmerId}</Text>
                        <Text style={styles.farmerNameText}>
                          {farmer.firstName} {farmer.lastName}
                        </Text>
                        <Text style={styles.farmerDistanceText}>
                          {farmer.distance.toFixed(2)} km away
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>No farmers found nearby</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={getCurrentLocation}
              >
                <IconSymbol
                  ios_icon_name="refresh"
                  android_material_icon_name="refresh"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.refreshButtonText}>Refresh Location</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <IconSymbol
                ios_icon_name="location"
                android_material_icon_name="location-on"
                size={24}
                color={colors.card}
              />
              <Text style={styles.locationButtonText}>Get Current Location</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spacing Compliance</Text>
          <Text style={styles.label}>Is spacing compliant? *</Text>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={yesButtonStyle}
              onPress={() => setSpacingCompliant(true)}
            >
              <Text style={yesTextStyle}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={noButtonStyle}
              onPress={() => setSpacingCompliant(false)}
            >
              <Text style={noTextStyle}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standards Adherence: Crop and Soil Scans</Text>
          <Text style={styles.subtitle}>Upload up to 5 photos</Text>

          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={16}
                    color={colors.card}
                  />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <IconSymbol
                      ios_icon_name="camera"
                      android_material_icon_name="camera"
                      size={32}
                      color={colors.primary}
                    />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Standards Adherence Notes *</Text>
          <Text style={styles.subtitle}>Max 160 characters</Text>
          <TextInput
            style={styles.commentsInput}
            value={standardsAdherenceNotes}
            onChangeText={setStandardsAdherenceNotes}
            placeholder="Enter observations about crop and soil standards..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={160}
          />
          <Text style={styles.characterCount}>
            {standardsAdherenceNotes.length}/160 characters
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
          <Text style={styles.subtitle}>Max 160 characters</Text>
          <TextInput
            style={styles.commentsInput}
            value={comments}
            onChangeText={setComments}
            placeholder="Enter any additional observations..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={160}
          />
          <Text style={styles.characterCount}>
            {comments.length}/160 characters
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Visit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
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
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dropdownList: {
    maxHeight: 300,
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
  farmerIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  farmerNameText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  farmerDistanceText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  locationButtonText: {
    fontSize: 16,
    color: colors.card,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  checkboxButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  checkboxButtonSelected: {
    flex: 1,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  checkboxButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  checkboxButtonTextSelected: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  commentsInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
