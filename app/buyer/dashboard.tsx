
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
  estimatedCollectionsByCrop: Array<{
    cropType: string;
    weekNumber: number;
    volumeKg: number;
    volumeLbs: number;
  }>;
}

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);
  const [buyerId, setBuyerId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 60)));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    estimatedCollectionsByCrop: [],
  });

  useEffect(() => {
    console.log('BuyerDashboard: Component mounted');
    loadUserData();
  }, []);

  useEffect(() => {
    if (buyerId) {
      loadDashboardData();
    }
  }, [buyerId, startDate, endDate]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userId && userData) {
        const user = JSON.parse(userData);
        setBuyerId(userId);
        setBuyerName(`${user.firstName} ${user.lastName}`);
        setOrganizationName(user.organizationName || '');
        console.log('BuyerDashboard: User data loaded', { userId });
      }
    } catch (error) {
      console.error('BuyerDashboard: Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('BuyerDashboard: Loading dashboard data', {
        buyerId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const { BACKEND_URL } = await import('@/utils/api');
      const response = await fetch(
        `${BACKEND_URL}/api/buyers/dashboard/${buyerId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        console.log('BuyerDashboard: Dashboard data loaded', data);
      } else {
        console.error('BuyerDashboard: Failed to load dashboard data');
      }
    } catch (error) {
      console.error('BuyerDashboard: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      console.log('BuyerDashboard: Start date changed', selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      console.log('BuyerDashboard: End date changed', selectedDate);
    }
  };

  // Group collections by crop type
  const groupedCollections = dashboardData.estimatedCollectionsByCrop.reduce((acc, item) => {
    if (!acc[item.cropType]) {
      acc[item.cropType] = [];
    }
    acc[item.cropType].push(item);
    return acc;
  }, {} as Record<string, typeof dashboardData.estimatedCollectionsByCrop>);

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
          <Text style={styles.headerTitle}>Buyer Dashboard</Text>
          <Text style={styles.headerSubtitle}>{buyerName}</Text>
          <Text style={styles.headerOrg}>{organizationName}</Text>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.sectionTitle}>Collection Period</Text>
          
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
            {/* Estimated Collections by Crop */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated Farmer Collections</Text>
              <Text style={styles.sectionSubtitle}>
                Based on service provider reports
              </Text>

              {Object.keys(groupedCollections).length === 0 ? (
                <Text style={styles.emptyText}>No collection data available</Text>
              ) : (
                Object.entries(groupedCollections).map(([cropType, collections]) => (
                  <View key={cropType} style={styles.cropCard}>
                    <View style={styles.cropHeader}>
                      <IconSymbol
                        ios_icon_name="leaf"
                        android_material_icon_name="eco"
                        size={24}
                        color={colors.primary}
                      />
                      <Text style={styles.cropTitle}>{cropType}</Text>
                    </View>

                    {collections.map((item, index) => (
                      <View key={index} style={styles.collectionRow}>
                        <View style={styles.weekBadge}>
                          <Text style={styles.weekText}>Week {item.weekNumber}</Text>
                        </View>
                        <View style={styles.volumeContainer}>
                          <Text style={styles.volumeText}>
                            {item.volumeKg.toFixed(0)} KG
                          </Text>
                          <Text style={styles.volumeSubtext}>
                            {item.volumeLbs.toFixed(0)} LBS
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Total for this crop */}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total {cropType}:</Text>
                      <View style={styles.volumeContainer}>
                        <Text style={styles.totalValue}>
                          {collections.reduce((sum, c) => sum + c.volumeKg, 0).toFixed(0)} KG
                        </Text>
                        <Text style={styles.volumeSubtext}>
                          {collections.reduce((sum, c) => sum + c.volumeLbs, 0).toFixed(0)} LBS
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Summary Card */}
            {Object.keys(groupedCollections).length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Overall Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Crops:</Text>
                  <Text style={styles.summaryValue}>
                    {Object.keys(groupedCollections).length}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Volume:</Text>
                  <View>
                    <Text style={styles.summaryValue}>
                      {dashboardData.estimatedCollectionsByCrop
                        .reduce((sum, c) => sum + c.volumeKg, 0)
                        .toFixed(0)}{' '}
                      KG
                    </Text>
                    <Text style={styles.summarySubvalue}>
                      {dashboardData.estimatedCollectionsByCrop
                        .reduce((sum, c) => sum + c.volumeLbs, 0)
                        .toFixed(0)}{' '}
                      LBS
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Collection Weeks:</Text>
                  <Text style={styles.summaryValue}>
                    {new Set(dashboardData.estimatedCollectionsByCrop.map((c) => c.weekNumber)).size}
                  </Text>
                </View>
              </View>
            )}
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
  headerOrg: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
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
  section: {
    marginBottom: 24,
  },
  cropCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cropTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  weekText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  volumeContainer: {
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  volumeSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'right',
  },
  summarySubvalue: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
