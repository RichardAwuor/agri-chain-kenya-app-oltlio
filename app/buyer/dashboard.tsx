
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { CROP_MATRIX } from '@/constants/PlusKenyaBranding';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DashboardData {
  estimatedCollectionsByCrop: Array<{
    cropType: string;
    weekNumber: number;
    volumeKg: number;
    volumeLbs: number;
  }>;
}

interface OrderEntry {
  cropType: string;
  volumeLbs: string;
}

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);
  const [buyerId, setBuyerId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    estimatedCollectionsByCrop: [],
  });

  // Order entry fields
  const [orderEntries, setOrderEntries] = useState<OrderEntry[]>([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    console.log('BuyerDashboard: Component mounted');
    loadUserData();
  }, []);

  useEffect(() => {
    if (buyerId) {
      loadDashboardData();
    }
  }, [buyerId]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userId && userData) {
        const user = JSON.parse(userData);
        setBuyerId(userId);
        const fullName = `${user.firstName} ${user.lastName}`;
        setBuyerName(fullName);
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
      console.log('BuyerDashboard: Loading dashboard data', { buyerId });

      const { BACKEND_URL } = await import('@/utils/api');
      const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = new Date(new Date().setDate(new Date().getDate() + 60));
      
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

  // Group collections by crop type and sum volumes
  const availableVolumeByCrop = dashboardData.estimatedCollectionsByCrop.reduce((acc, item) => {
    if (!acc[item.cropType]) {
      acc[item.cropType] = 0;
    }
    acc[item.cropType] += item.volumeLbs;
    return acc;
  }, {} as Record<string, number>);

  const getCropPrice = (cropType: string): number => {
    const crop = CROP_MATRIX.find(
      (c) => c.cropType.toLowerCase() === cropType.toLowerCase()
    );
    return crop ? crop.pricePerLb : 0;
  };

  const calculateInvoiceAmount = (cropType: string, volumeLbs: number): number => {
    const pricePerLb = getCropPrice(cropType);
    return pricePerLb * volumeLbs;
  };

  const calculatePaymentSplit = (invoiceAmount: number) => {
    const producerShare = invoiceAmount * 0.4;
    const serviceProviderShare = invoiceAmount * 0.4;
    const gokShare = invoiceAmount * 0.2;
    return { producerShare, serviceProviderShare, gokShare };
  };

  const addOrderEntry = () => {
    setOrderEntries([...orderEntries, { cropType: '', volumeLbs: '' }]);
  };

  const updateOrderEntry = (index: number, field: keyof OrderEntry, value: string) => {
    const newEntries = [...orderEntries];
    newEntries[index][field] = value;
    setOrderEntries(newEntries);
  };

  const removeOrderEntry = (index: number) => {
    const newEntries = orderEntries.filter((_, i) => i !== index);
    setOrderEntries(newEntries);
  };

  const handleSubmitOrder = async () => {
    if (orderEntries.length === 0) {
      Alert.alert('No Orders', 'Please add at least one order entry');
      return;
    }

    const invalidEntries = orderEntries.filter(
      (entry) => !entry.cropType || !entry.volumeLbs || parseFloat(entry.volumeLbs) <= 0
    );

    if (invalidEntries.length > 0) {
      Alert.alert('Invalid Entries', 'Please fill in all order entries with valid volumes');
      return;
    }

    setSubmittingOrder(true);
    console.log('BuyerDashboard: Submitting order', { orderEntries });

    try {
      // TODO: Backend Integration - POST order to backend
      // For now, just show success and reset form
      Alert.alert('Success', 'Delivery order submitted successfully');
      setOrderEntries([]);
      loadDashboardData(); // Reload dashboard data
    } catch (error) {
      console.error('BuyerDashboard: Error submitting order:', error);
      Alert.alert('Error', 'Failed to submit delivery order');
    } finally {
      setSubmittingOrder(false);
    }
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
          <Text style={styles.headerTitle}>Buyer Dashboard</Text>
          <Text style={styles.headerSubtitle}>{buyerName}</Text>
          <Text style={styles.headerOrg}>{organizationName}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            {/* Available Volume by Crop-Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Volume by Crop-Type</Text>
              <Text style={styles.sectionSubtitle}>
                Based on service provider collection estimates
              </Text>

              {Object.keys(availableVolumeByCrop).length === 0 ? (
                <Text style={styles.emptyText}>No available volume data</Text>
              ) : (
                Object.entries(availableVolumeByCrop).map(([cropType, volumeLbs]) => {
                  const invoiceAmount = calculateInvoiceAmount(cropType, volumeLbs);
                  const pricePerLb = getCropPrice(cropType);
                  const paymentSplit = calculatePaymentSplit(invoiceAmount);

                  return (
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

                      <View style={styles.cropDetail}>
                        <Text style={styles.detailLabel}>Available Volume:</Text>
                        <Text style={styles.detailValue}>{volumeLbs.toFixed(0)} LBS</Text>
                      </View>

                      <View style={styles.cropDetail}>
                        <Text style={styles.detailLabel}>Price per LB:</Text>
                        <Text style={styles.detailValue}>${pricePerLb.toFixed(2)}</Text>
                      </View>

                      <View style={styles.cropDetail}>
                        <Text style={styles.detailLabel}>Estimated Invoice:</Text>
                        <Text style={styles.detailValueHighlight}>
                          ${invoiceAmount.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.divider} />

                      <Text style={styles.splitTitle}>Payment Split (4:4:2)</Text>
                      <View style={styles.splitRow}>
                        <View style={styles.splitItem}>
                          <Text style={styles.splitLabel}>Producer (40%)</Text>
                          <Text style={styles.splitValue}>
                            ${paymentSplit.producerShare.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.splitItem}>
                          <Text style={styles.splitLabel}>Service Provider (40%)</Text>
                          <Text style={styles.splitValue}>
                            ${paymentSplit.serviceProviderShare.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.splitItem}>
                          <Text style={styles.splitLabel}>GOK (20%)</Text>
                          <Text style={styles.splitValue}>
                            ${paymentSplit.gokShare.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Order Entry Section */}
            <View style={styles.orderSection}>
              <Text style={styles.orderTitle}>Next Week Delivery Order</Text>
              <Text style={styles.orderSubtitle}>
                Enter delivery order by crop-type and volume (LBS)
              </Text>

              {orderEntries.map((entry, index) => (
                <View key={index} style={styles.orderEntry}>
                  <View style={styles.orderInputRow}>
                    <View style={styles.orderInputColumn}>
                      <Text style={styles.inputLabel}>Crop Type</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter crop type"
                        placeholderTextColor={colors.textSecondary}
                        value={entry.cropType}
                        onChangeText={(value) => updateOrderEntry(index, 'cropType', value)}
                      />
                    </View>

                    <View style={styles.orderInputColumn}>
                      <Text style={styles.inputLabel}>Volume (LBS)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        value={entry.volumeLbs}
                        onChangeText={(value) => updateOrderEntry(index, 'volumeLbs', value)}
                        keyboardType="numeric"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeOrderEntry(index)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.card}
                      />
                    </TouchableOpacity>
                  </View>

                  {entry.cropType && entry.volumeLbs && parseFloat(entry.volumeLbs) > 0 && (
                    <View style={styles.orderSummary}>
                      <Text style={styles.orderSummaryText}>
                        Estimated Cost: $
                        {calculateInvoiceAmount(
                          entry.cropType,
                          parseFloat(entry.volumeLbs)
                        ).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addOrderEntry}>
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.addButtonText}>Add Order Entry</Text>
              </TouchableOpacity>

              {orderEntries.length > 0 && (
                <TouchableOpacity
                  style={[styles.submitButton, submittingOrder && styles.submitButtonDisabled]}
                  onPress={handleSubmitOrder}
                  disabled={submittingOrder}
                >
                  {submittingOrder ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Delivery Order</Text>
                  )}
                </TouchableOpacity>
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
  headerOrg: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
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
  cropDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  splitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  splitItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  splitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  orderSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  orderEntry: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  orderInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  orderInputColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  removeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
