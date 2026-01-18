
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
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

export default function BuyerCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [buyerId, setBuyerId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Form data
  const [cropType, setCropType] = useState('');
  const [volumeLbs, setVolumeLbs] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7))); // Next week
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown data
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  // Calculated values
  const [estimatedInvoice, setEstimatedInvoice] = useState(0);
  const [farmerPayment, setFarmerPayment] = useState(0);
  const [serviceProviderPayment, setServiceProviderPayment] = useState(0);
  const [gokPayment, setGokPayment] = useState(0);

  useEffect(() => {
    console.log('BuyerCreateOrder: Component mounted');
    loadUserData();
    loadCropTypes();
  }, []);

  useEffect(() => {
    calculateInvoice();
  }, [volumeLbs]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userId && userData) {
        const user = JSON.parse(userData);
        setBuyerId(userId);
        setBuyerName(`${user.firstName} ${user.lastName}`);
        setOrganizationName(user.organizationName || '');
        console.log('BuyerCreateOrder: User data loaded', { userId });
      }
    } catch (error) {
      console.error('BuyerCreateOrder: Error loading user data:', error);
    }
  };

  const loadCropTypes = async () => {
    try {
      console.log('BuyerCreateOrder: Loading crop types');
      const { default: api } = await import('@/utils/api');
      const data = await api.getCropTypes();
      // Filter out NONE
      setCropTypes(data.filter((crop: string) => crop !== 'NONE'));
      console.log('BuyerCreateOrder: Crop types loaded', data);
    } catch (error) {
      console.error('BuyerCreateOrder: Error loading crop types:', error);
      setCropTypes(['Lettuce', 'Tomato', 'Cucumber', 'Capsicum', 'Cabbage', 'Broccoli', 'Green onion', 'Potato']);
    }
  };

  const calculateInvoice = () => {
    if (!volumeLbs) {
      setEstimatedInvoice(0);
      setFarmerPayment(0);
      setServiceProviderPayment(0);
      setGokPayment(0);
      return;
    }

    const volume = parseFloat(volumeLbs);
    const pricePerLb = 2; // Placeholder pricing: $2/lb
    const invoice = volume * pricePerLb;
    
    setEstimatedInvoice(invoice);
    setFarmerPayment(invoice * 0.4); // 40%
    setServiceProviderPayment(invoice * 0.4); // 40%
    setGokPayment(invoice * 0.2); // 20%
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeliveryDate(selectedDate);
      console.log('BuyerCreateOrder: Delivery date changed', selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!cropType) {
      Alert.alert('Validation Error', 'Please select a crop type');
      return false;
    }
    if (!volumeLbs || parseFloat(volumeLbs) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid volume');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (deliveryDate < nextWeek) {
      Alert.alert('Validation Error', 'Delivery date must be at least one week from today');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('BuyerCreateOrder: Submitting order');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { BACKEND_URL } = await import('@/utils/api');

      const orderData = {
        buyerId,
        cropType,
        volumeLbs: parseFloat(volumeLbs),
        deliveryDate: deliveryDate.toISOString(),
      };

      console.log('BuyerCreateOrder: Submitting order data', orderData);

      const response = await fetch(`${BACKEND_URL}/api/buyers/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      console.log('BuyerCreateOrder: Order created successfully', result);

      Alert.alert('Success', 'Order created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setCropType('');
            setVolumeLbs('');
            setDeliveryDate(new Date(new Date().setDate(new Date().getDate() + 7)));
          },
        },
      ]);
    } catch (error: any) {
      console.error('BuyerCreateOrder: Error submitting order:', error);
      Alert.alert('Error', error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Order',
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
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/0e340602-174b-4b22-bccd-82d159adc307.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Order</Text>
          <Text style={styles.headerSubtitle}>{buyerName}</Text>
          <Text style={styles.headerOrg}>{organizationName}</Text>
        </View>

        {/* Crop Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <Text style={styles.label}>Crop Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCropDropdown(!showCropDropdown)}
          >
            <Text style={cropType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {cropType || 'Select crop type'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showCropDropdown && (
            <View style={styles.dropdownList}>
              {cropTypes.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCropType(crop);
                    setShowCropDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{crop}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Volume (LBS) *</Text>
          <TextInput
            style={styles.input}
            value={volumeLbs}
            onChangeText={setVolumeLbs}
            placeholder="Enter volume in LBS"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Expected Delivery Date *</Text>
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
              {deliveryDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={deliveryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date(new Date().setDate(new Date().getDate() + 7))}
            />
          )}

          <Text style={styles.helperText}>
            Delivery must be at least one week from today
          </Text>
        </View>

        {/* Invoice Breakdown */}
        {estimatedInvoice > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Breakdown</Text>
            
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Estimated Invoice Amount:</Text>
              <Text style={styles.invoiceValue}>${estimatedInvoice.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Farmer Payment (40%):</Text>
              <Text style={styles.invoiceValue}>${farmerPayment.toFixed(2)}</Text>
            </View>

            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Service Provider Payment (40%):</Text>
              <Text style={styles.invoiceValue}>${serviceProviderPayment.toFixed(2)}</Text>
            </View>

            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>GOK Payment (20%):</Text>
              <Text style={styles.invoiceValue}>${gokPayment.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        {cropType && volumeLbs && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Organization:</Text>
              <Text style={styles.summaryValue}>{organizationName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Crop Type:</Text>
              <Text style={styles.summaryValue}>{cropType}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Volume:</Text>
              <Text style={styles.summaryValue}>{volumeLbs} LBS</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Date:</Text>
              <Text style={styles.summaryValue}>{deliveryDate.toLocaleDateString()}</Text>
            </View>
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
            <Text style={styles.submitButtonText}>Create Order</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
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
    marginBottom: 12,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  invoiceLabel: {
    fontSize: 16,
    color: colors.text,
  },
  invoiceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
