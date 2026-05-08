// API Service for HVAC Anomaly Detection
import { Alert } from '../types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the correct API URL based on platform
const getApiBaseUrl = () => {
  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  
  // For mobile, use the computer's local IP from Expo manifest
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    // Extract IP address (remove port if present)
    const host = debuggerHost.split(':')[0];
    return `http://${host}:3000/api`;
  }
  
  // Fallback to localhost (will fail on mobile but better than crashing)
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

export interface APIAlert {
  systemId: string;
  systemName: string;
  timestamp: string;
  riskScore: number;
  severity: string;
  affectedMetrics: string[];
  anomalyTypes: {
    sudden_spike: boolean;
    gradual_drift: boolean;
    statistical_outlier: boolean;
    trend_deviation: boolean;
    multi_sensor: boolean;
  };
  detectionMethods: {
    [key: string]: number;
  };
  explanation: string;
  anomalyCount: number;
  correlationCount: number;
  sensorData: {
    temperature: number;
    pressure: number;
    airflow: number;
    vibration: number;
    power: number;
  };
  aiExplanation?: {
    summary: string;
    possibleCause: string;
    recommendedAction: string;
    whyMatters?: string;
  };
}

export interface APIResponse {
  success: boolean;
  count: number;
  totalSystems: number;
  data: APIAlert[];
  detectionInfo: {
    methods: string[];
    hybrid: boolean;
  };
}

export interface APIStats {
  success: boolean;
  data: {
    total: number;
    withAnomalies: number;
    bySeverity: {
      CRITICAL: number;
      HIGH: number;
      MEDIUM: number;
      LOW: number;
    };
    byAnomalyType: {
      sudden_spike: number;
      gradual_drift: number;
      statistical_outlier: number;
      trend_deviation: number;
      multi_sensor: number;
    };
    avgRiskScore: number;
    totalAnomalies: number;
  };
}

// Convert API alert to app Alert format
function convertAPIAlert(apiAlert: APIAlert): Alert {
  return {
    id: apiAlert.systemId,
    system: {
      id: apiAlert.systemId,
      name: apiAlert.systemName,
      type: getSystemType(apiAlert.systemName),
      location: getSystemLocation(apiAlert.systemId),
      status: apiAlert.severity === 'CRITICAL' || apiAlert.severity === 'HIGH' ? 'ALERT' : 'WARNING' as any,
      normalRanges: {
        temperature: { min: 20, max: 45 },
        vibration: { min: 0.5, max: 4.0 },
        pressure: { min: 0.8, max: 1.5 },
        airflow: { min: 200, max: 400 },
      },
    },
    severity: apiAlert.severity as any,
    timestamp: apiAlert.timestamp,
    detectedAt: apiAlert.timestamp,
    metrics: [
      {
        id: `${apiAlert.systemId}-temp`,
        name: 'Temperature',
        type: 'temperature',
        value: apiAlert.sensorData.temperature,
        unit: '°C',
        status: apiAlert.affectedMetrics.includes('temp') ? 'CRITICAL' : 'NORMAL',
        normalRange: { min: 20, max: 45 },
        trend: 'stable',
      },
      {
        id: `${apiAlert.systemId}-pressure`,
        name: 'Pressure',
        type: 'pressure',
        value: apiAlert.sensorData.pressure,
        unit: 'bar',
        status: apiAlert.affectedMetrics.includes('pressure') ? 'CRITICAL' : 'NORMAL',
        normalRange: { min: 0.8, max: 1.5 },
        trend: 'stable',
      },
      {
        id: `${apiAlert.systemId}-airflow`,
        name: 'Airflow',
        type: 'airflow',
        value: apiAlert.sensorData.airflow,
        unit: 'CFM',
        status: apiAlert.affectedMetrics.includes('airflow') ? 'CRITICAL' : 'NORMAL',
        normalRange: { min: 200, max: 400 },
        trend: 'stable',
      },
      {
        id: `${apiAlert.systemId}-vibration`,
        name: 'Vibration',
        type: 'vibration',
        value: apiAlert.sensorData.vibration,
        unit: 'mm/s',
        status: apiAlert.affectedMetrics.includes('vibration') ? 'CRITICAL' : 'NORMAL',
        normalRange: { min: 0.02, max: 0.2 },
        trend: 'stable',
      },
      {
        id: `${apiAlert.systemId}-power`,
        name: 'Power',
        type: 'power',
        value: apiAlert.sensorData.power,
        unit: 'kW',
        status: apiAlert.affectedMetrics.includes('power') ? 'CRITICAL' : 'NORMAL',
        normalRange: { min: 5, max: 10 },
        trend: 'stable',
      },
    ],
    description: apiAlert.explanation,
    recommendation: getRecommendation(apiAlert),
    anomalyTypes: apiAlert.anomalyTypes,
    detectionMethods: apiAlert.detectionMethods,
    riskScore: apiAlert.riskScore,
  };
}

function getSystemType(systemName: string): 'compressor' | 'chiller' | 'air_handler' | 'cooling_tower' | 'boiler' {
  if (systemName.includes('Compressor')) return 'compressor';
  if (systemName.includes('Chiller')) return 'chiller';
  if (systemName.includes('Air Handler')) return 'air_handler';
  if (systemName.includes('Cooling Tower')) return 'cooling_tower';
  if (systemName.includes('Boiler')) return 'boiler';
  return 'compressor'; // default fallback
}

function getSystemLocation(systemId: string): string {
  const locations: { [key: string]: string } = {
    'HVAC_1': 'Building A - Basement',
    'HVAC_2': 'Building B - Roof',
    'HVAC_3': 'Building C - 3rd Floor',
    'HVAC_4': 'Building A - Roof',
    'HVAC_5': 'Building B - Basement',
  };
  return locations[systemId] || 'Unknown Location';
}

function getRecommendation(apiAlert: APIAlert): string {
  const riskScore = apiAlert.riskScore;
  const affectedSensors = apiAlert.affectedMetrics.join(', ');
  const anomalyCount = apiAlert.anomalyCount;
  
  // High risk - Urgent action needed
  if (riskScore >= 90) {
    return `Critical failure detected (Risk: ${riskScore}/100). Affected sensors: ${affectedSensors}. Immediate shutdown and inspection required.`;
  }
  
  // Multiple anomaly types detected
  const anomalyTypesList: string[] = [];
  if (apiAlert.anomalyTypes.sudden_spike) anomalyTypesList.push('sudden spike');
  if (apiAlert.anomalyTypes.gradual_drift) anomalyTypesList.push('gradual drift');
  if (apiAlert.anomalyTypes.statistical_outlier) anomalyTypesList.push('statistical outlier');
  if (apiAlert.anomalyTypes.trend_deviation) anomalyTypesList.push('trend deviation');
  
  if (riskScore >= 75) {
    const anomalyDesc = anomalyTypesList.length > 0 ? anomalyTypesList.join(', ') : 'multiple anomalies';
    return `High risk system degradation: ${anomalyDesc}. Affected: ${affectedSensors}. Schedule emergency maintenance within 4 hours.`;
  }
  
  if (riskScore >= 50) {
    return `Moderate risk detected in ${affectedSensors}. ${anomalyCount} anomalies found. Schedule inspection within 24 hours.`;
  }
  
  if (riskScore >= 25) {
    return `Low risk anomaly in ${affectedSensors}. Monitor system closely and verify sensor readings.`;
  }
  
  return 'Minor deviation detected. Continue normal monitoring.';
}

// Request deduplication: prevent multiple concurrent API calls
let pendingRequest: Promise<Alert[]> | null = null;
let isLoading = false;
const requestCache = new Map<string, { data: Alert[]; timestamp: number }>();
const REQUEST_CACHE_TTL = 10000; // 10 seconds

async function fetchAndEnhanceAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result: APIResponse = await response.json();
  
  if (!result.success) {
    throw new Error('API returned unsuccessful response');
  }
  
  // Convert API alerts to app format
  // AI explanations are now included from backend
  const alerts = result.data.map((apiAlert) => {
    const baseAlert = convertAPIAlert(apiAlert);
    
    // If backend provided AI explanation, use it
    if (apiAlert.aiExplanation) {
      return {
        ...baseAlert,
        description: apiAlert.aiExplanation.summary,
        recommendation: apiAlert.aiExplanation.recommendedAction,
        explanation: apiAlert.aiExplanation,
      };
    }
    
    return baseAlert;
  });
  
  return alerts;
}

export async function getAllAlerts(): Promise<Alert[]> {
  // Return pending request if already in progress
  if (pendingRequest) {
    console.log('⏳ Request already in progress, returning pending request');
    return pendingRequest;
  }

  // Check cache first (10 second TTL)
  const cacheKey = 'alerts';
  const cached = requestCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < REQUEST_CACHE_TTL) {
    console.log('✅ Returning cached alerts (age: ' + Math.floor((Date.now() - cached.timestamp) / 1000) + 's)');
    return cached.data;
  }

  // Create new request
  try {
    isLoading = true;
    pendingRequest = fetchAndEnhanceAlerts();
    const enhancedAlerts = await pendingRequest;
    
    // Cache result
    requestCache.set(cacheKey, {
      data: enhancedAlerts,
      timestamp: Date.now(),
    });
    
    return enhancedAlerts;
  } catch (error) {
    console.error('Error fetching alerts from API:', error);
    throw error;
  } finally {
    pendingRequest = null;
    isLoading = false;
  }
}

export async function getAlertStats(): Promise<APIStats['data']> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: APIStats = await response.json();
    
    if (!result.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching alert stats from API:', error);
    throw error;
  }
}

export async function getDetectionMethods() {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/detection-methods`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching detection methods from API:', error);
    throw error;
  }
}
