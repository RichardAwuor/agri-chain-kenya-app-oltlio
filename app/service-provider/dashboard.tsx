
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DashboardData {
  farmersVisited: number;
  cropsCovered: number;
  totalAcreage: number;
  projectedProductionByCrop: Array<{ cropType: string; volumeKg: number }>;
  collectionEstimationByCrop: Array<{ cropType: string; weekNumber: number; volumeKg: number }>;
  collectionVolumesByCrop: Array<{ cropType: string; volumeKg: number }>;
  shippedVolumesByCrop: Array<{ cropType: string; volumeKg: number }>;
  buyerOrdersByCrop: Array<{ cropType: string; volumeLbs: number }>;
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
    collectionVolumesByCrop: [],
    shippedVolumesByCrop: [],
    buyerOrdersByCrop: [],
  });

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
        setServiceProviderName(`${user.firstName} ${user.lastName}`);
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
                <Text style={styles.summaryValue}>{dashboardData.farmersVisited}</Text>
                <Text style={styles.summaryLabel}>Farmers Visited</Text>
              </View>

              <View style={styles.summaryCard}>
                <IconSymbol
                  ios_icon_name="leaf"
                  android_material_icon_name="eco"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.summaryValue}>{dashboardData.cropsCovered}</Text>
                <Text style={styles.summaryLabel}>Crops Covered</Text>
              </View>

              <View style={styles.summaryCard}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.summaryValue}>{dashboardData.totalAcreage.toFixed(1)}</Text>
                <Text style={styles.summaryLabel}>Total Acreage</Text>
              </View>
            </View>

            {/* Projected Production */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projected Production by Crop</Text>
              {dashboardData.projectedProductionByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.projectedProductionByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.cropType}</Text>
                    <Text style={styles.dataValue}>
                      {item.volumeKg.toFixed(0)} KG / {kgToLbs(item.volumeKg).toFixed(0)} LBS
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Collection Estimation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collection Estimation by Crop</Text>
              {dashboardData.collectionEstimationByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.collectionEstimationByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <View>
                      <Text style={styles.dataLabel}>{item.cropType}</Text>
                      <Text style={styles.dataSubtext}>Week {item.weekNumber}</Text>
                    </View>
                    <Text style={styles.dataValue}>
                      {item.volumeKg.toFixed(0)} KG
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Collection Volumes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collection Volumes by Crop</Text>
              {dashboardData.collectionVolumesByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.collectionVolumesByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.cropType}</Text>
                    <Text style={styles.dataValue}>
                      {item.volumeKg.toFixed(0)} KG / {kgToLbs(item.volumeKg).toFixed(0)} LBS
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Shipped Volumes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipped Volumes by Crop</Text>
              {dashboardData.shippedVolumesByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.shippedVolumesByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.cropType}</Text>
                    <Text style={styles.dataValue}>
                      {item.volumeKg.toFixed(0)} KG / {kgToLbs(item.volumeKg).toFixed(0)} LBS
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Buyer Orders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buyer Orders by Crop</Text>
              {dashboardData.buyerOrdersByCrop.length === 0 ? (
                <Text style={styles.emptyText}>No data available</Text>
              ) : (
                dashboardData.buyerOrdersByCrop.map((item, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataLabel}>{item.cropType}</Text>
                    <Text style={styles.dataValue}>
                      {item.volumeLbs.toFixed(0)} LBS
                    </Text>
                  </View>
                ))
              )}
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
    minWidth: '30%',
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
  dataSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
});
