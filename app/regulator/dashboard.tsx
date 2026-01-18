
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
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

  useEffect(() => {
    console.log('RegulatorDashboard: Component mounted');
    loadUserData();
  }, []);

  useEffect(() => {
    if (regulatorId) {
      loadDashboardData();
    }
  }, [regulatorId, startDate, endDate]);

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

  const loadDashboardData = async () => {
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
      // Set fallback data
      setDashboardData({
        farmersVisited: 0,
        cropsCovered: [],
        totalAcreage: 0,
        projectedVolumePerCrop: {},
      });
    } finally {
      setLoading(false);
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
            <Text style={styles.summaryValue}>{dashboardData?.farmersVisited || 0}</Text>
            <Text style={styles.summaryLabel}>Farmers Visited</Text>
          </View>

          <View style={styles.summaryCard}>
            <IconSymbol
              ios_icon_name="leaf"
              android_material_icon_name="eco"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>{dashboardData?.cropsCovered.length || 0}</Text>
            <Text style={styles.summaryLabel}>Crops Covered</Text>
          </View>

          <View style={styles.summaryCard}>
            <IconSymbol
              ios_icon_name="map"
              android_material_icon_name="map"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>
              {dashboardData?.totalAcreage.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.summaryLabel}>Total Acreage</Text>
          </View>
        </View>

        {/* Crops Covered */}
        {dashboardData && dashboardData.cropsCovered.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crops Covered</Text>
            <View style={styles.cropsContainer}>
              {dashboardData.cropsCovered.map((crop, index) => (
                <View key={index} style={styles.cropChip}>
                  <Text style={styles.cropChipText}>{crop}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projected Volume per Crop */}
        {dashboardData && Object.keys(dashboardData.projectedVolumePerCrop).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projected Volume per Crop</Text>
            {Object.entries(dashboardData.projectedVolumePerCrop).map(([crop, volumeKg]) => (
              <View key={crop} style={styles.volumeCard}>
                <View style={styles.volumeHeader}>
                  <Text style={styles.volumeCropName}>{crop}</Text>
                </View>
                <View style={styles.volumeRow}>
                  <View style={styles.volumeItem}>
                    <Text style={styles.volumeValue}>{volumeKg.toLocaleString()}</Text>
                    <Text style={styles.volumeUnit}>KG</Text>
                  </View>
                  <View style={styles.volumeDivider} />
                  <View style={styles.volumeItem}>
                    <Text style={styles.volumeValue}>{kgToLbs(volumeKg).toLocaleString()}</Text>
                    <Text style={styles.volumeUnit}>LBS</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

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
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cropChipText: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '600',
  },
  volumeCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  volumeHeader: {
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
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  volumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  volumeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  volumeUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  volumeDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
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
