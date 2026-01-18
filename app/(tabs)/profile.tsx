
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id?: string;
  userType: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  idNumber: string;
  farmerId?: string;
  county: string;
  subCounty: string;
  ward: string;
  addressLat: number;
  addressLng: number;
  farmAcreage: number;
  cropType: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedCropType, setEditedCropType] = useState('');
  const [projectedHarvest, setProjectedHarvest] = useState<number | null>(null);

  useEffect(() => {
    console.log('ProfileScreen: Loading user data');
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const dataString = await AsyncStorage.getItem('userData');
      if (dataString) {
        const data = JSON.parse(dataString);
        console.log('ProfileScreen: User data loaded', data);
        setUserData(data);
        setEditedCropType(data.cropType);
        
        // Fetch projected harvest from backend if user is a producer
        if (data.userType === 'producer') {
          await fetchProjectedHarvest(data.id);
        } else {
          // Fallback to local calculation for non-producers
          calculateProjectedHarvest(data.cropType, data.farmAcreage);
        }
      }
    } catch (error) {
      console.error('ProfileScreen: Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectedHarvest = async (userId: string) => {
    try {
      console.log('ProfileScreen: Fetching projected harvest from backend for user', userId);
      const { default: api } = await import('@/utils/api');
      const result = await api.getProjectedHarvest(userId);
      console.log('ProfileScreen: Projected harvest fetched from backend', result);
      setProjectedHarvest(result.projectedVolumeKg || 0);
    } catch (error) {
      console.error('ProfileScreen: Error fetching projected harvest from backend:', error);
      // Fallback to local calculation if API fails
      if (userData) {
        calculateProjectedHarvest(userData.cropType, userData.farmAcreage);
      }
    }
  };

  const calculateProjectedHarvest = (cropType: string, acreage: number) => {
    console.log('ProfileScreen: Calculating projected harvest locally', { cropType, acreage });
    const cropMatrix: { [key: string]: number } = {
      'Maize': 2000,
      'Beans': 800,
      'Potatoes': 15000,
      'Tomatoes': 20000,
      'Cabbage': 25000,
      'Other': 1000,
    };

    const yieldPerAcre = cropMatrix[cropType] || 1000;
    const projected = yieldPerAcre * acreage;
    console.log('ProfileScreen: Projected harvest calculated locally', projected);
    setProjectedHarvest(projected);
  };

  const handleSaveCropType = async () => {
    if (!userData) return;

    console.log('ProfileScreen: Saving crop type update', editedCropType);
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        const { default: api } = await import('@/utils/api');
        console.log('ProfileScreen: Updating crop type via API', { userId, cropType: editedCropType });
        await api.updateUser(userId, { cropType: editedCropType });
        
        // Fetch updated projected harvest from backend
        if (userData.userType === 'producer') {
          await fetchProjectedHarvest(userId);
        } else {
          calculateProjectedHarvest(editedCropType, userData.farmAcreage);
        }
      }

      const updatedData = { ...userData, cropType: editedCropType };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      setEditing(false);
      
      Alert.alert('Success', 'Crop type updated successfully!');
    } catch (error) {
      console.error('ProfileScreen: Error updating crop type:', error);
      Alert.alert('Error', 'Failed to update crop type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="person.circle"
            android_material_icon_name="account-circle"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No profile data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cropTypes = ['Maize', 'Beans', 'Potatoes', 'Tomatoes', 'Cabbage', 'Other'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="account-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.card}>
            {userData.farmerId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Farmer ID</Text>
                <Text style={[styles.infoValue, styles.farmerIdValue]}>{userData.farmerId}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{userData.firstName} {userData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userData.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {new Date(userData.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>County</Text>
              <Text style={styles.infoValue}>{userData.county}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sub-County</Text>
              <Text style={styles.infoValue}>{userData.subCounty}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ward</Text>
              <Text style={styles.infoValue}>{userData.ward}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="eco"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Farm Information</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Farm Acreage</Text>
              <Text style={styles.infoValue}>{userData.farmAcreage} acres</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crop Type</Text>
              {editing ? (
                <View style={styles.editContainer}>
                  {cropTypes.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[
                        styles.cropOption,
                        editedCropType === crop && styles.cropOptionSelected,
                      ]}
                      onPress={() => setEditedCropType(crop)}
                    >
                      <Text
                        style={[
                          styles.cropOptionText,
                          editedCropType === crop && styles.cropOptionTextSelected,
                        ]}
                      >
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>{userData.cropType}</Text>
              )}
            </View>
            {!editing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  console.log('ProfileScreen: Edit crop type button pressed');
                  setEditing(true);
                }}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Edit Crop Type</Text>
              </TouchableOpacity>
            )}
            {editing && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    console.log('ProfileScreen: Cancel edit');
                    setEditing(false);
                    setEditedCropType(userData.cropType);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveCropType}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.card} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {projectedHarvest !== null && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="bar-chart"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>Projected Harvest</Text>
            </View>
            <View style={[styles.card, styles.highlightCard]}>
              <Text style={styles.harvestValue}>{projectedHarvest.toLocaleString()} KG</Text>
              <Text style={styles.harvestLabel}>
                Based on {userData.farmAcreage} acres of {userData.cropType}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            You can update your crop type before each planting season. Projected harvest is calculated based on your farm acreage and crop type.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightCard: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  farmerIdValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  editContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  cropOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cropOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  cropOptionTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  harvestValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  harvestLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
});
