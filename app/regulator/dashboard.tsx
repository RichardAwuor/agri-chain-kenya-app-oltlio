
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
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
import api from '@/utils/api';

interface DashboardData {
  farmersVisited: number;
  cropsCovered: string[];
  totalAcreage: number;
  projectedVolumePerCrop: Record<string, number>;
}

export default function RegulatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [regulatorId, setRegulatorId] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Date range
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Report entry fields
  const [correctSpacing, setCorrectSpacing] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    console.log('RegulatorDashboard: Component mounted');
    loadUserData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    console.log('RegulatorDashboard: Loading dashboard data');
    setLoading(true);
    try {
      const response = await fetch(
        api.getRegulatorDashboard(
          regulatorId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      );
      const data = await response.json();
      setDashboardData(data);
      console.log('RegulatorDashboard: Dashboard data loaded:', data);
    } catch (error) {
      console.error('RegulatorDashboard: Error loading dashboard data:', error);
      setDashboardData({
        farmersVisited: 0,
        cropsCovered: [],
        totalAcreage: 0,
        projectedVolumePerCrop: {},
      });
    } finally {
      setLoading(false);
    }
  }, [regulatorId, startDate, endDate]);

  useEffect(() => {
    if (regulatorId) {
      loadDashboardData();
    }
  }, [regulatorId, startDate, endDate, loadDashboardData]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setRegulatorId(userId);
        console.log('RegulatorDashboard: Loaded user ID:', userId);
      }
    } catch (error) {
      console.error('RegulatorDashboard: Error loading user data:', error);
    }
  };



  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      console.log('RegulatorDashboard: Start date changed to', selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      console.log('RegulatorDashboard: End date changed to', selectedDate);
    }
  };

  const kgToLbs = (kg: number): number => {
    return kg * 2.20462;
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
      console.log('RegulatorDashboard: Photo added', result.assets[0].uri);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    console.log('RegulatorDashboard: Photo removed at index', index);
  };

  const handleSubmitReport = async () => {
    if (correctSpacing === null) {
      Alert.alert('Missing Information', 'Please confirm crop spacing');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Missing Photos', 'Please upload at least one photo of crop/soil standards');
      return;
    }

    if (comments.trim().length === 0) {
      Alert.alert('Missing Comments', 'Please add comments about standards adherence');
      return;
    }

    if (comments.length > 160) {
      Alert.alert('Comments Too Long', 'Comments must be 160 characters or less');
      return;
    }

    setSubmittingReport(true);
    console.log('RegulatorDashboard: Submitting report entry', {
      correctSpacing,
      photoCount: photos.length,
      commentsLength: comments.length,
    });

    try {
      // TODO: Backend Integration - POST report entry to backend
      // For now, just show success and reset form
      Alert.alert('Success', 'Report entry submitted successfully');
      setCorrectSpacing(null);
      setPhotos([]);
      setComments('');
      loadDashboardData(); // Reload dashboard data
    } catch (error) {
      console.error('RegulatorDashboard: Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report entry');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Dashboard',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.card,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  const farmersVisitedValue = dashboardData?.farmersVisited || 0;
  const cropsCountValue = dashboardData?.cropsCovered.length || 0;
  const totalAcreageValue = dashboardData?.totalAcreage.toFixed(1) || '0.0';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Dashboard',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.card,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.sectionTitle}>Report Period</Text>
          <View style={styles.dateRangeRow}>
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
                <Text style={styles.dateButtonText}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                  maximumDate={endDate}
                />
              )}
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
                <Text style={styles.dateButtonText}>
                  {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
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
              ios_icon_name="leaf"
              android_material_icon_name="eco"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>{cropsCountValue}</Text>
            <Text style={styles.summaryLabel}>Crops Covered</Text>
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

        {/* Projected Volume per Crop */}
        {dashboardData && Object.keys(dashboardData.projectedVolumePerCrop).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projected Volume per Crop (LBS)</Text>
            {Object.entries(dashboardData.projectedVolumePerCrop).map(([crop, volumeKg]) => {
              const volumeLbs = kgToLbs(volumeKg);
              return (
                <View key={crop} style={styles.volumeCard}>
                  <Text style={styles.volumeCropName}>{crop}</Text>
                  <Text style={styles.volumeValue}>{volumeLbs.toLocaleString()} LBS</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Report Entry Section */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Report Entry</Text>

          {/* Crop Spacing Confirmation */}
          <View style={styles.reportField}>
            <Text style={styles.fieldLabel}>Confirm Correct Crop Spacing</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkboxButton,
                  correctSpacing === true && styles.checkboxButtonActive,
                ]}
                onPress={() => setCorrectSpacing(true)}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    correctSpacing === true && styles.checkboxTextActive,
                  ]}
                >
                  YES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkboxButton,
                  correctSpacing === false && styles.checkboxButtonActive,
                ]}
                onPress={() => setCorrectSpacing(false)}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    correctSpacing === false && styles.checkboxTextActive,
                  ]}
                >
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo Upload */}
          <View style={styles.reportField}>
            <Text style={styles.fieldLabel}>
              Evidence of Standards Adherence (Crop & Soil Scans)
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
            <Text style={styles.fieldLabel}>Comments (Max 160 characters)</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="Add comments about standards adherence..."
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

        {/* Empty State */}
        {dashboardData && dashboardData.farmersVisited === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="chart"
              android_material_icon_name="bar-chart"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No Data Available</Text>
            <Text style={styles.emptyStateText}>
              No farmer visits recorded for the selected period.
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  dateRangeContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  volumeCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeCropName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  reportSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
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
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
  },
  checkboxButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  checkboxButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  checkboxTextActive: {
    color: colors.card,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
