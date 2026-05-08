// Alert data types following the system blueprint
export interface Alert {
  id: string;
  system: HVACSystem;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  detectedAt: string;
  metrics: AlertMetric[];
  description: string;
  recommendation: string;
  // Enhanced hybrid detection fields
  anomalyTypes?: {
    sudden_spike: boolean;
    gradual_drift: boolean;
    statistical_outlier: boolean;
    trend_deviation: boolean;
    multi_sensor: boolean;
  };
  detectionMethods?: {
    [key: string]: number;
  };
  riskScore?: number; // 0-100
  // LLM-generated explanation
  explanation?: Explanation;
}

// LLM-generated explanation for alerts
export interface Explanation {
  summary: string; // Brief description of what's happening
  possibleCause: string; // Likely root cause in technician-friendly language
  recommendedAction: string; // Specific next steps to take
  whyMatters?: string; // Operational impact explanation
}

export interface AlertMetric {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  normalRange: { min: number; max: number };
  trend: 'rising' | 'falling' | 'stable';
}

export interface SystemUnit {
  id: string;
  name: string;
  type: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  alertCount: number;
}

// HVAC Sensor Data Types
export interface SensorData {
  systemId: string;
  timestamp: Date;
  temperature: number; // Celsius
  vibration: number; // mm/s (RMS velocity)
  pressure: number; // kPa
  airflow: number; // m³/h
}

// Anomaly Detection Types
export interface Anomaly {
  id: string;
  sensorType: 'temperature' | 'vibration' | 'pressure' | 'airflow';
  detectedValue: number;
  expectedRange: { min: number; max: number };
  deviationPercent: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectionMethod: 'zscore' | 'isolation_forest' | 'threshold' | 'trend_analysis';
  timestamp: Date;
}

// HVAC System Types
export interface HVACSystem {
  id: string;
  name: string;
  type: 'compressor' | 'chiller' | 'air_handler' | 'cooling_tower' | 'boiler';
  location: string;
  normalRanges: {
    temperature: { min: number; max: number };
    vibration: { min: number; max: number };
    pressure: { min: number; max: number };
    airflow: { min: number; max: number };
  };
  currentSensorData?: SensorData;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
}
