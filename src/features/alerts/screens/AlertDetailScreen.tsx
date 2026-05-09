import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAllAlerts } from '@/features/alerts/services/apiService';
import { Alert } from '@/features/alerts/types';
import { getRelativeTime, getActionTimeframe } from '@/shared/utils/formatUtils';

export const AlertDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id, alertData } = useLocalSearchParams<{ id: string; alertData?: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAlert = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, try to use the passed alert data to avoid race conditions
      if (alertData) {
        try {
          const parsedAlert = JSON.parse(alertData as string);
          setAlert(parsedAlert);
          console.log('📋 Alert detail loaded from params:', parsedAlert.system.name, 'Risk:', parsedAlert.riskScore);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Failed to parse alert data, fetching fresh:', parseError);
        }
      }
      
      // Fallback: fetch fresh data if no alert data was passed
      const alerts = await getAllAlerts();
      const found = alerts.find(a => a.id === id);
      setAlert(found || null);
      console.log('📋 Alert detail fetched from API:', found?.system.name, 'Risk:', found?.riskScore);
    } catch (err) {
      console.error('Failed to load alert:', err);
    } finally {
      setLoading(false);
    }
  }, [id, alertData]);

  // Load alert ONCE on mount only - don't refresh on every focus
  useEffect(() => {
    loadAlert();
  }, [loadAlert]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#2c3e50" />
        </View>
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Alert not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'HIGH':
        return '#f57c00';
      case 'MEDIUM':
        return '#fbc02d';
      case 'LOW':
      default:
        return '#388e3c';
    }
  };

  const getSeverityLabel = (severity: string): string => {
    // Use severity labels as-is for clarity
    return severity;
  };

  const relativeTime = getRelativeTime(alert.timestamp);
  const actionTimeframe = getActionTimeframe(alert.riskScore || 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{alert.system.name}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Risk Banner - Large and Clear */}
        <View
          style={[
            styles.riskBanner,
            { backgroundColor: getSeverityColor(alert.severity) },
          ]}
        >
          <View style={styles.riskContent}>
            <Text style={styles.riskLabel}>RISK LEVEL</Text>
            <Text style={styles.riskValue}>{alert.riskScore || 0}</Text>
            <View style={styles.severityContainer}>
              <Text style={styles.severityLabel}>{getSeverityLabel(alert.severity)} PRIORITY</Text>
            </View>
          </View>
          <View style={styles.timeframeContainer}>
            <Text style={styles.timeframeLabel}>Action Required:</Text>
            <Text style={styles.timeframeValue}>{actionTimeframe}</Text>
          </View>
        </View>

        {/* System Info - Clean Layout */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{alert.system.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>System Type:</Text>
            <Text style={styles.value}>{alert.system.type.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Detected:</Text>
            <Text style={styles.value}>{relativeTime}</Text>
          </View>
        </View>

        {/* What's Wrong - Primary Info */}
        <View style={styles.section}>
          <Text style={styles.bigSectionTitle}>⚠️ WHAT'S WRONG</Text>
          <View style={[styles.sectionCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.sectionText}>{alert.description}</Text>
          </View>
        </View>

        {/* Why This Matters - Impact */}
        {alert.explanation?.whyMatters && (
          <View style={styles.section}>
            <Text style={styles.bigSectionTitle}>💡 WHY THIS MATTERS</Text>
            <View style={[styles.sectionCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.sectionText}>{alert.explanation.whyMatters}</Text>
            </View>
          </View>
        )}

        {/* Possible Cause - Technical Info */}
        {alert.explanation?.possibleCause && (
          <View style={styles.section}>
            <Text style={styles.bigSectionTitle}>🔍 LIKELY CAUSE</Text>
            <View style={[styles.sectionCard, { backgroundColor: '#f3e5f5' }]}>
              <Text style={styles.sectionText}>{alert.explanation.possibleCause}</Text>
            </View>
          </View>
        )}

        {/* What To Do - Action Focused */}
        <View style={styles.section}>
          <Text style={styles.bigSectionTitle}>🔧 WHAT TO DO</Text>
          <View style={[styles.sectionCard, styles.actionCard]}>
            <Text style={styles.actionText}>
              {alert.explanation?.recommendedAction || alert.recommendation}
            </Text>
          </View>
        </View>

        {/* Affected Sensors - Compact Display */}
        {(alert.riskScore || 0) > 0 && alert.metrics.filter(m => m.status === 'CRITICAL' || m.status === 'WARNING').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affected Sensors</Text>
            <View style={styles.metricsCard}>
              {alert.metrics
                .filter((m) => {
                  // Only show sensors that are actually affected (CRITICAL or WARNING)
                  const isAffected = m.status === 'CRITICAL' || m.status === 'WARNING';
                  const hasValidValue = m.value != null && !isNaN(m.value);
                  return isAffected && hasValidValue;
                })
                .map((metric) => {
                // Smart decimal formatting based on value magnitude
                let formattedValue;
                if (metric.value < 0.1) {
                  formattedValue = metric.value.toFixed(3); // 3 decimals for tiny values
                } else if (metric.value < 10) {
                  formattedValue = metric.value.toFixed(2); // 2 decimals for small values
                } else {
                  formattedValue = metric.value.toFixed(1); // 1 decimal for normal values
                }
                
                return (
                  <View key={metric.id} style={styles.metricRow}>
                    <Text style={styles.metricName}>• {metric.name}</Text>
                    <Text style={[
                      styles.metricValue,
                      metric.status === 'CRITICAL' && styles.criticalValue
                    ]}>
                      {formattedValue} {metric.unit}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backArrow: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 18,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  riskBanner: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  riskContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 72,
  },
  severityContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  timeframeContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  timeframeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  timeframeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  bigSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginBottom: 10,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#388e3c',
  },
  actionText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  metricsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  metricName: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  criticalValue: {
    color: '#d32f2f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: '700',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
