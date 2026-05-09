import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, StatusBar, Platform, AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCard } from '@/shared/components/AlertCard';
import { getAllAlerts } from '@/features/alerts/services/apiService';
import { Alert } from '@/features/alerts/types';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllAlerts();
      setAlerts(data);
      lastRefreshRef.current = Date.now();
      console.log('✅ Alerts refreshed:', data.length, 'alerts loaded');
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load alerts. Check backend server on localhost:3000');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load only
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Handle app state changes (background/foreground) - for mobile
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground - refresh data
        console.log('🔄 App came to foreground - refreshing alerts');
        loadAlerts();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [loadAlerts]);

  // Set up polling interval - 30 seconds for real-time updates
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      console.log('⏰ Polling interval - refreshing alerts');
      loadAlerts();
    }, 30000); // 30 seconds for better real-time updates

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAlerts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts();
  }, [loadAlerts]);

  const handleAlertPress = useCallback((alert: Alert) => {
    // Pass the full alert data to avoid race conditions with changing data
    router.push({ 
      pathname: '/(tabs)/alert-detail', 
      params: { 
        id: alert.id,
        alertData: JSON.stringify(alert)
      } 
    });
  }, [router]);

  // Sort alerts by risk score (highest first)
  const sortedAlerts = React.useMemo(
    () => [...alerts].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)),
    [alerts]
  );

  // Separate critical and urgent alerts
  const criticalAlerts = React.useMemo(
    () => sortedAlerts.filter(a => a.severity === 'CRITICAL'),
    [sortedAlerts]
  );

  const urgentAlerts = React.useMemo(
    () => sortedAlerts.filter(a => a.severity === 'HIGH'),
    [sortedAlerts]
  );

  const remainingAlerts = React.useMemo(
    () => sortedAlerts.filter(a => a.severity !== 'CRITICAL' && a.severity !== 'HIGH'),
    [sortedAlerts]
  );

  const renderHeader = () => {
    // Count by actual severity
    const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const highCount = alerts.filter((a) => a.severity === 'HIGH').length;
    const totalUrgentAndCritical = highCount + criticalCount;

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>HVAC Monitoring</Text>
          <Text style={styles.headerSubtitle}>
            {totalUrgentAndCritical > 0 ? `${totalUrgentAndCritical} need attention` : 'All systems monitored'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {highCount > 0 && (
            <View style={[styles.statBadge, styles.urgentBadge]}>
              <Text style={styles.statNumber}>{highCount}</Text>
              <Text style={styles.statLabel}>High</Text>
            </View>
          )}
          {criticalCount > 0 && (
            <View style={[styles.statBadge, styles.criticalBadge]}>
              <Text style={styles.statNumber}>{criticalCount}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#2c3e50" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centerContent]}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorHint}>
            Start the backend:{'\n'}cd server && npm start
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.content}>
        {renderHeader()}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2c3e50']} />
          }
        >
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <View style={styles.prioritySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔴 CRITICAL PRIORITY</Text>
                <Text style={styles.sectionSubtitle}>
                  {criticalAlerts.length} system{criticalAlerts.length > 1 ? 's' : ''} require immediate action
                </Text>
              </View>
              {criticalAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => handleAlertPress(alert)}
                />
              ))}
            </View>
          )}

          {/* High Priority Alerts */}
          {urgentAlerts.length > 0 && (
            <View style={styles.prioritySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🟠 HIGH PRIORITY</Text>
                <Text style={styles.sectionSubtitle}>
                  {urgentAlerts.length} system{urgentAlerts.length > 1 ? 's' : ''} require prompt action
                </Text>
              </View>
              {urgentAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => handleAlertPress(alert)}
                />
              ))}
            </View>
          )}

          {/* Other Alerts */}
          {remainingAlerts.length > 0 && (
            <View style={styles.remainingSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📊 OTHER ALERTS</Text>
                <Text style={styles.sectionSubtitle}>
                  {remainingAlerts.length} system{remainingAlerts.length > 1 ? 's' : ''} being monitored
                </Text>
              </View>
              {remainingAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => handleAlertPress(alert)}
                />
              ))}
            </View>
          )}

          {alerts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>✅ All systems normal</Text>
              <Text style={styles.emptySubtext}>No alerts at this time</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 20,
    paddingHorizontal: 18,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  urgentBadge: {
    backgroundColor: '#f57c00', // Orange for urgent/high priority
  },
  criticalBadge: {
    backgroundColor: '#d32f2f', // Red for critical
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  scrollContent: {
    padding: 18,
  },
  prioritySection: {
    marginBottom: 26,
  },
  remainingSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#388e3c',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
