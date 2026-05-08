import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertMetric } from '@/features/alerts/types';

interface MetricItemProps {
  metric: AlertMetric;
}

export const MetricItem: React.FC<MetricItemProps> = ({ metric }) => {
  const isAbnormal = metric.status === 'CRITICAL' || metric.status === 'WARNING';

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'rising':
        return '↑';
      case 'falling':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'rising':
        return '#d32f2f';
      case 'falling':
        return '#1976d2';
      default:
        return '#388e3c';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'WARNING':
        return '#f57c00';
      default:
        return '#388e3c';
    }
  };

  return (
    <View
      style={[
        styles.container,
        isAbnormal && styles.abnormalBorder,
      ]}
    >
      <View style={styles.nameRow}>
        <Text style={styles.metricName}>{metric.name}</Text>
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.trendIcon,
              { color: getTrendColor(metric.trend) },
            ]}
          >
            {getTrendIcon(metric.trend)}
          </Text>
          <Text style={[styles.status, { color: getStatusColor(metric.status) }]}>
            {metric.status}
          </Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <View style={styles.currentValueSection}>
          <Text style={styles.label}>Current</Text>
          <Text style={styles.currentValue}>
            {metric.value.toFixed(2)}
            <Text style={styles.unit}> {metric.unit}</Text>
          </Text>
        </View>

        <View style={styles.normalRangeSection}>
          <Text style={styles.label}>Normal Range</Text>
          <Text style={styles.normalRange}>
            {metric.normalRange.min} - {metric.normalRange.max}
            <Text style={styles.unit}> {metric.unit}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  abnormalBorder: {
    borderColor: '#f57c00',
    backgroundColor: '#fff8f3',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentValueSection: {
    flex: 1,
  },
  normalRangeSection: {
    flex: 1,
    marginLeft: 16,
  },
  label: {
    fontSize: 11,
    color: '#9e9e9e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  normalRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9e9e9e',
  },
});
