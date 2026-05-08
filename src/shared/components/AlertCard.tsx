import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from '@/features/alerts/types';
import { getRelativeTime, getUrgencyLevel, getActionTimeframe } from '@/shared/utils/formatUtils';

interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
}

export const AlertCard = React.memo<AlertCardProps>(({ alert, onPress }) => {
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

  const getSeverityBgColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return '#ffebee';
      case 'HIGH':
        return '#fff3e0';
      case 'MEDIUM':
        return '#fffde7';
      case 'LOW':
      default:
        return '#f1f8e9';
    }
  };

  const urgencyLevel = getUrgencyLevel(alert.riskScore || 0);
  const timeframe = getActionTimeframe(alert.riskScore || 0);
  const relativeTime = getRelativeTime(alert.timestamp);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.card,
          { 
            borderLeftColor: getSeverityColor(alert.severity),
            backgroundColor: getSeverityBgColor(alert.severity),
          },
        ]}
      >
        {/* Header with Status Badge */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {alert.system.name}
              </Text>
              <View
                style={[
                  styles.urgencyBadge,
                  { backgroundColor: getSeverityColor(alert.severity) },
                ]}
              >
                <Text style={styles.urgencyText}>{urgencyLevel}</Text>
              </View>
            </View>
            <Text style={styles.location}>{alert.system.location}</Text>
            <Text style={styles.timestamp}>🕐 {relativeTime}</Text>
          </View>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getSeverityColor(alert.severity) },
            ]}
          >
            <Text style={styles.riskNumber}>{alert.riskScore || 0}</Text>
          </View>
        </View>

        {/* Description - Bigger Text */}
        <Text style={styles.description} numberOfLines={2}>
          {alert.description}
        </Text>

        {/* Footer with Action Timeframe */}
        <View style={styles.footer}>
          <View style={styles.timeframeContainer}>
            <Text style={styles.timeframeLabel}>Action:</Text>
            <Text style={[styles.timeframeValue, { color: getSeverityColor(alert.severity) }]}>
              {timeframe}
            </Text>
          </View>
          <Text style={styles.tapHint}>TAP FOR DETAILS →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

AlertCard.displayName = 'AlertCard';

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    marginRight: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  riskBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  riskNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeframeLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginRight: 6,
  },
  timeframeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
