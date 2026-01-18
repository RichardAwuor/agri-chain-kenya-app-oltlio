
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import * as Location from 'expo-location';
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
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ServiceProviderReporting() {
  const [loading, setLoading] = useState(false);
  const [serviceProviderId, setServiceProviderId] = useState('');
  const [serviceProviderName, setServiceProviderName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Form data
  const [visitDate, setVisitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [nearbyFarmers, setNearbyFarmers] = useState<any[]>([]);
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [collectionEstimationWeek, setCollectionEstimationWeek] = useState('');
  const [collectedCropType, setCollectedCropType] = useState('');
  const [collectedVolumeKg, setCollectedVolumeKg] = useState('');
  const [shippedCropType, setShippedCropType] = useState('');
  const [shippedVolumeKg, setShippedVolumeKg] = useState('');
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [showCollectedCropDropdown, setShowCollectedCropDropdown] = useState(false);
  const [showShippedCropDropdown, setShowShippedCropDropdown] = useState(false);

  useEffect(() => {
    console.log('ServiceProviderReporting: Component mounted');
    loadUserData();
    loadCropTypes();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userId && userData) {
        const user = JSON.parse(userData);
        setServiceProviderId(userId);
        setServiceProviderName(`${user.firstName} ${user.lastName}`);
        setOrganizationName(user.organizationName || '');
        console.log('ServiceProviderReporting: User data loaded', { userId, name: serviceProviderName });
      }
    } catch (error) {
      console.error('ServiceProviderReporting: Error loading user data:', error);
    }
  };

  const loadCropTypes = async () => {
    try {
      console.log('ServiceProviderReporting: Loading crop types');
      // TODO: Backend Integration - GET /api/dropdown-data/crop-types
      const response = await fetch('https://efny4tujb4fvak3wz84axmrptxuz7wbq.app.specular.dev/api/dropdown-data/crop-types');
      const data = await response.json();
      setCropTypes(data);
      console.log('ServiceProviderReporting: Crop types loaded', data);
    } catch (error) {
      console.error('ServiceProviderReporting: Error loading crop types:', error);
      setCropTypes(['Avocado', 'Mango', 'Passion Fruit', 'Pineapple', 'Banana', 'NONE']);
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('ServiceProviderReporting: Getting current location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby farmers');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(coords);
      console.log('ServiceProviderReporting: Location obtained', coords);
      
      // Load nearby farmers
      loadNearbyFarmers(coords.lat, coords.lng);
    } catch (error) {
      console.error('ServiceProviderReporting: Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const loadNearbyFarmers = async (lat: number, lng: number) => {
    try {
      console.log('ServiceProviderReporting: Loading nearby farmers', { lat, lng });
      // TODO: Backend Integration - GET /api/service-providers/nearby-farmers?lat=X&lng=Y&radius=5000
      const response = await fetch(
        `https://efny4tujb4fvak3wz84axmrptxuz7wbq.app.specular.dev/api/service-providers/nearby-farmers?lat=${lat}&lng=${lng}&radius=5000`
      );
      const data = await response.json();
      setNearbyFarmers(data);
      console.log('ServiceProviderReporting: Nearby farmers loaded', data.length);
    } catch (error) {
      console.error('ServiceProviderReporting: Error loading nearby farmers:', error);
      setNearbyFarmers([]);
    }
  };

  const pickPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 photos');
      return;
    }

    console.log('ServiceProviderReporting: Picking photo');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
      console.log('ServiceProviderReporting: Photo added', photos.length + 1);
    }
  };

  const removePhoto = (index: number) => {
    console.log('ServiceProviderReporting: Removing photo', index);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setVisitDate(selectedDate);
      console.log('ServiceProviderReporting: Visit date changed', selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(visitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setVisitDate(newDate);
      console.log('ServiceProviderReporting: Visit time changed', newDate);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedFarmer) {
      Alert.alert('Validation Error', 'Please select a farmer');
      return false;
    }
    if (!currentLocation) {
      Alert.alert('Validation Error', 'Location not available. Please enable location services');
      return false;
    }
    if (collectionEstimationWeek) {
      const weekNum = parseInt(collectionEstimationWeek);
      const currentWeek = getWeekNumber(new Date());
      const minWeek = currentWeek + 1; // At least 7 days ahead
      if (weekNum < minWeek) {
        Alert.alert('Validation Error', 'Collection estimation must be at least 7 days ahead');
        return false;
      }
    }
    if (comments.length > 160) {
      Alert.alert('Validation Error', 'Comments must be 160 characters or less');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('ServiceProviderReporting: Submitting visit report');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: Backend Integration - POST /api/service-providers/visits
      const visitData = {
        serviceProviderId,
        producerId: selectedFarmer.id,
        visitDate: visitDate.toISOString(),
        visitLat: currentLocation!.lat,
        visitLng: currentLocation!.lng,
        collectionEstimationWeek: collectionEstimationWeek ? parseInt(collectionEstimationWeek) : null,
        collectedCropType: collectedCropType || null,
        collectedVolumeKg: collectedVolumeKg ? parseFloat(collectedVolumeKg) : null,
        shippedCropType: shippedCropType || null,
        shippedVolumeKg: shippedVolumeKg ? parseFloat(shippedVolumeKg) : null,
        comments: comments || null,
        photos, // Array of photo URIs
      };

      console.log('ServiceProviderReporting: Submitting visit data', visitData);

      // For now, show success message
      Alert.alert('Success', 'Visit report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedFarmer(null);
            setCollectionEstimationWeek('');
            setCollectedCropType('');
            setCollectedVolumeKg('');
            setShippedCropType('');
            setShippedVolumeKg('');
            setComments('');
            setPhotos([]);
            setVisitDate(new Date());
          },
        },
      ]);
    } catch (error) {
      console.error('ServiceProviderReporting: Error submitting visit:', error);
      Alert.alert('Error', 'Failed to submit visit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Visit Reporting',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.card,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Farm Visit</Text>
          <Text style={styles.headerSubtitle}>{serviceProviderName}</Text>
          <Text style={styles.headerOrg}>{organizationName}</Text>
        </View>

        {/* Visit Date and Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Date & Time</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.dateText}>
              {visitDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="access-time"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.dateText}>
              {visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={visitDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Farmer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Farmer (Nearby)</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowFarmerDropdown(!showFarmerDropdown)}
          >
            <Text style={selectedFarmer ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedFarmer ? `${selectedFarmer.farmerId} - ${selectedFarmer.firstName} ${selectedFarmer.lastName}` : 'Select farmer'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showFarmerDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {nearbyFarmers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No nearby farmers found</Text>
                </View>
              ) : (
                nearbyFarmers.map((farmer) => (
                  <TouchableOpacity
                    key={farmer.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedFarmer(farmer);
                      setShowFarmerDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {farmer.farmerId} - {farmer.firstName} {farmer.lastName}
                    </Text>
                    <Text style={styles.dropdownItemSubtext}>
                      {farmer.distance ? `${Math.round(farmer.distance)}m away` : ''}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Collection Estimation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Estimation</Text>
          <Text style={styles.label}>Week Number (at least 7 days ahead)</Text>
          <TextInput
            style={styles.input}
            value={collectionEstimationWeek}
            onChangeText={setCollectionEstimationWeek}
            placeholder="e.g., 15"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>
            Current week: {getWeekNumber(new Date())}
          </Text>
        </View>

        {/* Collected Crop */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collected Crop</Text>
          
          <Text style={styles.label}>Crop Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCollectedCropDropdown(!showCollectedCropDropdown)}
          >
            <Text style={collectedCropType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {collectedCropType || 'Select crop type'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showCollectedCropDropdown && (
            <View style={styles.dropdownList}>
              {cropTypes.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCollectedCropType(crop);
                    setShowCollectedCropDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{crop}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Volume (KG)</Text>
          <TextInput
            style={styles.input}
            value={collectedVolumeKg}
            onChangeText={setCollectedVolumeKg}
            placeholder="Enter volume in KG"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Shipped Crop */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipped Crop</Text>
          
          <Text style={styles.label}>Crop Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowShippedCropDropdown(!showShippedCropDropdown)}
          >
            <Text style={shippedCropType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {shippedCropType || 'Select crop type'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showShippedCropDropdown && (
            <View style={styles.dropdownList}>
              {cropTypes.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShippedCropType(crop);
                    setShowShippedCropDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{crop}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Volume (KG)</Text>
          <TextInput
            style={styles.input}
            value={shippedVolumeKg}
            onChangeText={setShippedVolumeKg}
            placeholder="Enter volume in KG"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Pictures (Max 5)</Text>
          
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={pickPhoto}
            disabled={photos.length >= 5}
          >
            <IconSymbol
              ios_icon_name="camera"
              android_material_icon_name="camera"
              size={32}
              color={photos.length >= 5 ? colors.textSecondary : colors.primary}
            />
            <Text style={styles.addPhotoText}>
              {photos.length >= 5 ? 'Maximum photos reached' : 'Add Photo'}
            </Text>
          </TouchableOpacity>

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
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
          </View>
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments (Max 160 characters)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comments}
            onChangeText={setComments}
            placeholder="Enter comments about the visit..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={160}
          />
          <Text style={styles.characterCount}>
            {comments.length}/160
          </Text>
        </View>

        {/* Location Info */}
        {currentLocation && (
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
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerOrg: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
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
    marginBottom: 12,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
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
  dropdownItemSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addPhotoButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addPhotoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
