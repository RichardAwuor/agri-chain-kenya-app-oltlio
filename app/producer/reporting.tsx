
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

type ReportType = 'planting' | 'tending' | 'harvesting' | 'shipping';

interface Report {
  id: string;
  type: ReportType;
  weekNumber: number;
  year: number;
  notes: string;
  date: string;
}

export default function ProducerReporting() {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [weekNumber, setWeekNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  React.useEffect(() => {
    console.log('ProducerReporting: Component mounted, loading existing reports');
    loadExistingReports();
  }, []);

  const reportTypes = [
    {
      type: 'planting' as ReportType,
      title: 'Planting Week',
      icon: 'eco',
      color: '#4CAF50',
      description: 'Report when you plant your crops',
    },
    {
      type: 'tending' as ReportType,
      title: 'Tending Week',
      icon: 'build',
      color: '#2196F3',
      description: 'Report pruning, weeding activities',
    },
    {
      type: 'harvesting' as ReportType,
      title: 'Harvesting Week',
      icon: 'agriculture',
      color: '#FF9800',
      description: 'Report when you harvest crops',
    },
    {
      type: 'shipping' as ReportType,
      title: 'Shipping Week',
      icon: 'local-shipping',
      color: '#9C27B0',
      description: 'Report when you ship products',
    },
  ];

  const loadExistingReports = async () => {
    console.log('ProducerReporting: Loading existing reports from backend');
    setLoadingReports(true);
    
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        console.log('ProducerReporting: No user ID found, skipping report load');
        setLoadingReports(false);
        return;
      }

      const { default: api } = await import('@/utils/api');
      const existingReports = await api.getProducerReports(userId);
      
      console.log('ProducerReporting: Loaded reports from backend', existingReports);
      
      // Transform backend reports to match our Report interface
      const transformedReports: Report[] = existingReports.map((report: any) => ({
        id: report.id,
        type: report.reportType as ReportType,
        weekNumber: report.weekNumber,
        year: report.year,
        notes: report.notes || '',
        date: report.createdAt,
      }));
      
      setReports(transformedReports);
    } catch (error) {
      console.error('ProducerReporting: Error loading existing reports:', error);
      // Don't show error alert, just log it - user can still create new reports
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmitReport = async () => {
    console.log('ProducerReporting: Submitting report', {
      type: selectedType,
      weekNumber,
      notes,
    });

    if (!selectedType) {
      Alert.alert('Validation Error', 'Please select a report type');
      return;
    }

    if (!weekNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter the week number');
      return;
    }

    const week = parseInt(weekNumber);
    if (isNaN(week) || week < 1 || week > 52) {
      Alert.alert('Validation Error', 'Please enter a valid week number (1-52)');
      return;
    }

    setLoading(true);

    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Error', 'User not found. Please register first.');
        return;
      }

      const { default: api } = await import('@/utils/api');
      
      const reportData = {
        producerId: userId,
        reportType: selectedType,
        weekNumber: week,
        year: new Date().getFullYear(),
        notes,
      };

      console.log('ProducerReporting: Submitting report to backend', reportData);
      const result = await api.createProducerReport(reportData);

      const newReport: Report = {
        id: result.report.id,
        type: selectedType,
        weekNumber: week,
        year: new Date().getFullYear(),
        notes,
        date: new Date().toISOString(),
      };

      setReports([newReport, ...reports]);
      console.log('ProducerReporting: Report added', newReport);

      Alert.alert('Success', 'Report submitted successfully!');
      
      // Reset form
      setSelectedType(null);
      setWeekNumber('');
      setNotes('');
    } catch (error) {
      console.error('ProducerReporting: Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeInfo = (type: ReportType) => {
    return reportTypes.find(rt => rt.type === type);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Reporting',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.card,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(home)/')}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 16 }}
            >
              <IconSymbol
                ios_icon_name="house"
                android_material_icon_name="home"
                size={24}
                color={colors.card}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
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

        {/* Report Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Report Type</Text>
          <View style={styles.reportTypesGrid}>
            {reportTypes.map((reportType) => (
              <TouchableOpacity
                key={reportType.type}
                style={[
                  styles.reportTypeCard,
                  selectedType === reportType.type && styles.reportTypeCardSelected,
                ]}
                onPress={() => {
                  console.log('ProducerReporting: Report type selected', reportType.type);
                  setSelectedType(reportType.type);
                }}
              >
                <View style={[styles.reportTypeIcon, { backgroundColor: reportType.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={reportType.icon}
                    android_material_icon_name={reportType.icon}
                    size={28}
                    color={reportType.color}
                  />
                </View>
                <Text style={styles.reportTypeTitle}>{reportType.title}</Text>
                <Text style={styles.reportTypeDescription}>{reportType.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Report Form */}
        {selectedType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Week Number (1-52) *</Text>
              <TextInput
                style={styles.input}
                value={weekNumber}
                onChangeText={setWeekNumber}
                placeholder="Enter week number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Reports */}
        {loadingReports ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading your reports...</Text>
            </View>
          </View>
        ) : reports.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {reports.map((report) => {
              const typeInfo = getReportTypeInfo(report.type);
              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={[styles.reportIcon, { backgroundColor: typeInfo?.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={typeInfo?.icon || 'document'}
                        android_material_icon_name={typeInfo?.icon || 'description'}
                        size={20}
                        color={typeInfo?.color || colors.primary}
                      />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>{typeInfo?.title}</Text>
                      <Text style={styles.reportDate}>
                        Week {report.weekNumber}, {report.year}
                      </Text>
                    </View>
                  </View>
                  {report.notes && (
                    <Text style={styles.reportNotes}>{report.notes}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Submit reports for each stage of your farming cycle to track your progress and help with harvest projections.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  reportTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  reportTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reportTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  reportTypeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reportNotes: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingLeft: 52,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
