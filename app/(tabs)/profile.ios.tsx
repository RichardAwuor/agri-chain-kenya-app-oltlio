
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CROP_MATRIX, calculateProjectedHarvest as calculateHarvest } from "@/constants/PlusKenyaBranding";
import { router } from 'expo-router';
import ConfirmModal from '@/components/ConfirmModal';

interface UserData {
  id?: string;
  userType: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  idNumber?: string;
  farmerId?: string;
  county: string;
  subCounty: string;
  ward: string;
  addressLat?: number;
  addressLng?: number;
  farmAcreage?: number;
  cropType?: string;
  organizationName?: string;
  coreMandates?: string[];
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedCropType, setEditedCropType] = useState('');
  const [projectedHarvest, setProjectedHarvest] = useState<{
    volumeLbs: number;
    volumeKg: number;
    revenuePerSeason: number;
    farmerEarningPerMonth: number;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen (iOS): Loading user data');
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const dataString = await AsyncStorage.getItem('userData');
      if (dataString) {
        const data = JSON.parse(dataString);
        console.log('ProfileScreen (iOS): User data loaded', data);
        setUserData(data);
        setEditedCropType(data.cropType);
        
        // Calculate projected harvest using crop matrix
        if (data.userType === 'producer' && data.cropType && data.farmAcreage) {
          const harvest = calculateHarvest(data.cropType, data.farmAcreage);
          console.log('ProfileScreen (iOS): Projected harvest calculated', harvest);
          setProjectedHarvest(harvest);
        }
      }
    } catch (error) {
      console.error('ProfileScreen (iOS): Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCropType = async () => {
    if (!userData) return;

    console.log('ProfileScreen (iOS): Saving crop type update', editedCropType);
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        const { default: api } = await import('@/utils/api');
        console.log('ProfileScreen (iOS): Updating crop type via API', { userId, cropType: editedCropType });
        await api.updateUser(userId, { cropType: editedCropType });
        
        // Recalculate projected harvest with new crop type
        const harvest = calculateHarvest(editedCropType, userData.farmAcreage);
        console.log('ProfileScreen (iOS): Projected harvest recalculated', harvest);
        setProjectedHarvest(harvest);
      }

      const updatedData = { ...userData, cropType: editedCropType };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      setEditing(false);
      
      setShowSaveSuccessModal(true);
    } catch (error) {
      console.error('ProfileScreen (iOS): Error updating crop type:', error);
      setShowSaveErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    console.log('ProfileScreen (iOS): Delete account button pressed');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log('ProfileScreen (iOS): User confirmed first delete prompt');
    setShowDeleteModal(false);
    setShowConfirmDeleteModal(true);
  };

  const handleFinalDelete = async () => {
    console.log('ProfileScreen (iOS): User confirmed final delete - proceeding with account deletion');
    setDeleting(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      // Read userType from both userData and AsyncStorage (fallback)
      const storedUserType = await AsyncStorage.getItem('userType');
      
      if (userId && userData) {
        const { default: api } = await import('@/utils/api');
        // Use userType from userData first, then fall back to AsyncStorage value
        const userTypeValue = userData.userType || storedUserType || '';
        console.log('ProfileScreen (iOS): Deleting account via API', { userId, userType: userTypeValue });
        
        // Call appropriate delete endpoint based on user type
        console.log('ProfileScreen (iOS): User type for deletion:', userTypeValue);
        if (userTypeValue === 'producer') {
          await api.deleteProducer(userId);
        } else if (userTypeValue === 'regulator') {
          await api.deleteRegulator(userId);
        } else if (userTypeValue === 'service-provider' || userTypeValue === 'service_provider') {
          await api.deleteServiceProvider(userId);
        } else if (userTypeValue === 'buyer') {
          await api.deleteBuyer(userId);
        } else {
          console.warn('ProfileScreen (iOS): Unknown user type for deletion:', userTypeValue);
          // Attempt generic user deletion as fallback
          await api.deleteProducer(userId);
        }
      }

      // Clear all local data
      await AsyncStorage.multiRemove(['userId', 'userData', 'userType']);
      console.log('ProfileScreen (iOS): Account deleted successfully, redirecting to welcome screen');
      
      setShowConfirmDeleteModal(false);
      
      // Redirect to welcome screen
      router.replace('/welcome');
    } catch (error) {
      console.error('ProfileScreen (iOS): Error deleting account:', error);
      setShowConfirmDeleteModal(false);
      setShowDeleteErrorModal(true);
      setDeleting(false);
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

  // Get crop types from crop matrix
  const cropTypes = CROP_MATRIX.map(crop => crop.cropName);

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
            {userData.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            )}
            {userData.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone}</Text>
              </View>
            )}
            {userData.dateOfBirth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {new Date(userData.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            )}
            {userData.organizationName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Organization</Text>
                <Text style={styles.infoValue}>{userData.organizationName}</Text>
              </View>
            )}
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

        {userData.userType === 'producer' && userData.farmAcreage && userData.cropType && (
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
                    console.log('ProfileScreen (iOS): Edit crop type button pressed');
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
                      console.log('ProfileScreen (iOS): Cancel edit');
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
        )}

        {userData.userType === 'regulator' && userData.coreMandates && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="checkmark.shield"
                android_material_icon_name="verified"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>Core Mandates</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.mandatesContainer}>
                {userData.coreMandates.map((mandate, index) => (
                  <View key={index} style={styles.mandateChip}>
                    <Text style={styles.mandateChipText}>{mandate}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {projectedHarvest && (
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
              <View style={styles.harvestRow}>
                <View style={styles.harvestItem}>
                  <Text style={styles.harvestValue}>{projectedHarvest.volumeKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} KG</Text>
                  <Text style={styles.harvestLabel}>Volume</Text>
                </View>
                <View style={styles.harvestItem}>
                  <Text style={styles.harvestValue}>{projectedHarvest.volumeLbs.toLocaleString(undefined, { maximumFractionDigits: 0 })} LBS</Text>
                  <Text style={styles.harvestLabel}>Volume</Text>
                </View>
              </View>
              <View style={styles.harvestRow}>
                <View style={styles.harvestItem}>
                  <Text style={styles.harvestValue}>${projectedHarvest.revenuePerSeason.toLocaleString()}</Text>
                  <Text style={styles.harvestLabel}>Revenue/Season</Text>
                </View>
                <View style={styles.harvestItem}>
                  <Text style={styles.harvestValue}>${projectedHarvest.farmerEarningPerMonth.toLocaleString()}</Text>
                  <Text style={styles.harvestLabel}>Earning/Month</Text>
                </View>
              </View>
              <Text style={styles.harvestFooter}>
                Based on {userData.farmAcreage} acres of {userData.cropType}
              </Text>
            </View>
          </View>
        )}

        {userData.userType === 'producer' && (
          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              You can update your crop type before each planting season. Projected harvest is calculated based on your farm acreage and crop type using the FRESH-Start crop matrix.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={24}
              color="#DC143C"
            />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          </View>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.dangerText}>
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={20}
                color={colors.card}
              />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        destructive
      />

      <ConfirmModal
        visible={showConfirmDeleteModal}
        title="Final Confirmation"
        message="This is your last chance. Are you absolutely sure you want to permanently delete your account and all associated data?"
        confirmText="Delete Forever"
        cancelText="Keep Account"
        onConfirm={handleFinalDelete}
        onCancel={() => setShowConfirmDeleteModal(false)}
        loading={deleting}
        destructive
      />

      <ConfirmModal
        visible={showDeleteErrorModal}
        title="Deletion Failed"
        message="Failed to delete your account. Please try again later."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowDeleteErrorModal(false)}
        onCancel={() => setShowDeleteErrorModal(false)}
        destructive
      />

      <ConfirmModal
        visible={showSaveSuccessModal}
        title="Success"
        message="Crop type updated successfully!"
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowSaveSuccessModal(false)}
        onCancel={() => setShowSaveSuccessModal(false)}
      />

      <ConfirmModal
        visible={showSaveErrorModal}
        title="Update Failed"
        message="Failed to update crop type. Please try again."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowSaveErrorModal(false)}
        onCancel={() => setShowSaveErrorModal(false)}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  dangerTitle: {
    color: '#DC143C',
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
  dangerCard: {
    backgroundColor: '#DC143C10',
    borderColor: '#DC143C',
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
    fontFamily: 'Courier',
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
  harvestRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  harvestItem: {
    alignItems: 'center',
  },
  harvestValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  harvestLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  harvestFooter: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
  mandatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mandateChip: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mandateChipText: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '600',
  },
  dangerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC143C',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
