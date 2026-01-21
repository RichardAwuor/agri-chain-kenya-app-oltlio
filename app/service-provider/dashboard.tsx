
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DashboardData {
  farmersVisited: number;
  cropsCovered: number;
  totalAcreage: number;
  projectedProductionByCrop: Array<{ cropType: string; volumeKg: number }>;
  collectionEstimationByCrop: Array<{ cropType: string; weekNumber: number; volumeKg: number }>;
}

export default function ServiceProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [serviceProviderId, setServiceProviderId] = useState('');
  const [serviceProviderName, setServiceProviderName] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    farmersVisited: 0,
    cropsCovered: 0,
    totalAcreage: 0,
    projectedProductionByCrop: [],
    collectionEstimationByCrop: [],
  });

  // Report entry fields
  const [selectedCrop, setSelectedCrop] = useState('');
  const [collectionWeek, setCollectionWeek] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  useEffect(() => {
    console.log('ServiceProviderDashboard: Component mounted');
    loadUserData();
  }, []);

  useEffect(() => {
    if (serviceProviderId) {
      loadDashboardData();
    }
  }, [serviceProviderId, startDate, endDate]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userId && userData) {
        const user = JSON.parse(userData);
        setServiceProviderId(userId);
        const fullName = `${user.firstName} ${user.lastName}`;
        setServiceProviderName(fullName);
        console.log('ServiceProviderDashboard: User data loaded', { userId });
      }
    } catch (error) {
      console.error('ServiceProviderDashboard: Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('ServiceProviderDashboard: Loading dashboard data', {
        serviceProviderId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const { BACKEND_URL } = await import('@/utils/api');
      const response = await fetch(
        `${BACKEND_URL}/api/service-providers/dashboard/${serviceProviderId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        console.log('ServiceProviderDashboard: Dashboard data loaded', data);
      } else {
        console.error('ServiceProviderDashboard: Failed to load dashboard data');
      }
    } catch (error) {
      console.error('ServiceProviderDashboard: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      console.log('ServiceProviderDashboard: Start date changed', selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      console.log('ServiceProviderDashboard: End date changed', selectedDate);
    }
  };

  const kgToLbs = (kg: number): number => {
    return kg * 2.20462;
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const pickPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Maximum Photos', 'You can only upload up to 5 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
      console.log('ServiceProviderDashboard: Photo added', result.assets[0].uri);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    console.log('ServiceProviderDashboard: Photo removed at index', index);
  };

  const handleSubmitReport = async () => {
    if (!selectedCrop) {
      Alert.alert('Missing Information', 'Please select a crop type');
      return;
    }

    if (!collectionWeek) {
      Alert.alert('Missing Information', 'Please enter collection week');
      return;
    }

    const weekNum = parseInt(collectionWeek);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
      Alert.alert('Invalid Week', 'Please enter a week number between 1 and 53');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Missing Photos', 'Please upload at least one photo of crop maturity');
      return;
    }

    if (comments.trim().length === 0) {
      Alert.alert('Missing Comments', 'Please add comments about crop maturity');
      return;
    }

    if (comments.length > 160) {
      Alert.alert('Comments Too Long', 'Comments must be 160 characters or less');
      return;
    }

    setSubmittingReport(true);
    console.log('ServiceProviderDashboard: Submitting report entry', {
      selectedCrop,
      collectionWeek: weekNum,
      photoCount: photos.length,
      commentsLength: comments.length,
    });

    try {
      // TODO: Backend Integration - POST report entry to backend
      // For now, just show success and reset form
      Alert.alert('Success', 'Report entry submitted successfully');
      setSelectedCrop('');
      setCollectionWeek('');
      setPhotos([]);
      setComments('');
      loadDashboardData(); // Reload dashboard data
    } catch (error) {
      console.error('ServiceProviderDashboard: Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report entry');
    } finally {
      setSubmittingReport(false);
    }
  };

  const farmersVisitedValue = dashboardData.farmersVisited;
  const totalAcreageValue = dashboardData.totalAcreage.toFixed(1);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Dashboard',
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Service Provider Dashboard</Text>
          <Text style={styles.headerSubtitle}>{serviceProviderName}</Text>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.sectionTitle}>Report Period</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <IconSymbol
                  ios_icon_name="person"
                  android_material_icon_name="person"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.summaryValue}>{farmersVisitedValue}</Text>
                <Text style={styles.summaryLabel}>Farmers Visited</Text>
              </View>

              <View style={styles.summaryCard}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.summaryValue}>{totalAcreageValue}</Text>
                <Text style={styles.summaryLabel}>Total Acreage</Text>
              </View>
            </View>

            {/* Projected Production */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projected Production Volume (LBS) per Crop</Text>
              {dashboardData.projectedProductionByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.projectedProductionByCrop.map((item, index) => {
                  const volumeLbs = kgToLbs(item.volumeKg);
                  return (
                    <View key={index} style={styles.dataRow}>
                      <Text style={styles.dataLabel}>{item.cropType}</Text>
                      <Text style={styles.dataValue}>{volumeLbs.toFixed(0)} LBS</Text>
                    </View>
                  );
                })
              )}
            </View>

            {/* Estimated Collection Week */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated Collection Week per Crop</Text>
              {dashboardData.collectionEstimationByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.collectionEstimationByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.cropType}</Text>
                    <Text style={styles.dataValue}>Week {item.weekNumber}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Report Entry Section */}
            <View style={styles.reportSection}>
              <Text style={styles.reportTitle}>Report Entry</Text>

              {/* Crop Selection */}
              <View style={styles.reportField}>
                <Text style={styles.fieldLabel}>Select Crop Type</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter crop type"
                  placeholderTextColor={colors.textSecondary}
                  value={selectedCrop}
                  onChangeText={setSelectedCrop}
                />
              </View>

              {/* Collection Week Input */}
              <View style={styles.reportField}>
                <Text style={styles.fieldLabel}>
                  Input Crop Maturity/Collection Week (1-53)
                </Text>
                <Text style={styles.fieldSubtext}>
                  Collections scheduled at least 7 days ahead
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter week number (1-53)"
                  placeholderTextColor={colors.textSecondary}
                  value={collectionWeek}
                  onChangeText={setCollectionWeek}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              {/* Photo Upload */}
              <View style={styles.reportField}>
                <Text style={styles.fieldLabel}>
                  Picture Evidence of Crop Maturity
                </Text>
                <Text style={styles.fieldSubtext}>Upload up to 5 pictures</Text>

                <View style={styles.photosContainer}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: photo }} style={styles.photoPreview} />
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
                    <TouchableOpacity style={styles.addPhotoButton} onPress={pickPhoto}>
                      <IconSymbol
                        ios_icon_name="camera"
                        android_material_icon_name="camera"
                        size={32}
                        color={colors.primary}
                      />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Comments */}
              <View style={styles.reportField}>
                <Text style={styles.fieldLabel}>Summary Comments (Max 160 characters)</Text>
                <TextInput
                  style={styles.commentsInput}
                  placeholder="Add comments about crop maturity..."
                  placeholderTextColor={colors.textSecondary}
                  value={comments}
                  onChangeText={setComments}
                  maxLength={160}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.characterCount}>
                  {comments.length}/160 characters
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submittingReport && styles.submitButtonDisabled]}
                onPress={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report Entry</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
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
  dateRangeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  reportSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 20,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  reportField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  fieldSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
