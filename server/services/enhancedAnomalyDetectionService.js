const cleaning = require('../utils/dataCleaningUtils');
const hybrid = require('../utils/hybridDetectionUtils');
const sensorDataSource = require('./sensorDataSource');

const SENSOR_FIELDS = ['temp', 'pressure', 'airflow', 'vibration', 'power'];
const METHOD_WEIGHTS = { 'Z-Score': 0.25, 'Rolling Mean Deviation': 0.20, 'Sudden Spike': 0.25, 'Gradual Drift': 0.15, 'Multi-Sensor Correlation': 0.15 };
const SEVERITY_SCORES = { 'CRITICAL': 100, 'HIGH': 70, 'MEDIUM': 40, 'LOW': 20 };

function groupBySystem(data) {
  return data.reduce((acc, row) => {
    if (!acc[row.unit_id]) acc[row.unit_id] = [];
    acc[row.unit_id].push(row);
    return acc;
  }, {});
}

function calculateStats(data, field) {
  const values = data.map(r => parseFloat(r[field]));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

function runHybridDetection(systemData, systemId) {
  const allAnomalies = [];
  const cleanedData = cleaning.handleMissingValues(systemData, SENSOR_FIELDS);
  SENSOR_FIELDS.forEach(field => {
    const stats = calculateStats(cleanedData, field);
    allAnomalies.push(...hybrid.detectZScoreAnomalies(cleanedData, field, stats));
    allAnomalies.push(...hybrid.detectRollingMeanAnomalies(cleanedData, field, 10));
    allAnomalies.push(...hybrid.detectSuddenSpikes(cleanedData, field));
    allAnomalies.push(...hybrid.detectGradualDrift(cleanedData, field, 20));
  });
  const correlationAnomalies = hybrid.detectMultiSensorCorrelation(allAnomalies, SENSOR_FIELDS);
  const latestIndex = cleanedData.length - 1;
  const recentAnomalies = allAnomalies.filter(a => a.index >= latestIndex - 5);
  const methodCounts = {};
  recentAnomalies.forEach(a => { methodCounts[a.method] = (methodCounts[a.method] || 0) + 1; });
  const anomalyTypes = {
    sudden_spike: recentAnomalies.filter(a => a.method === 'Sudden Spike'),
    gradual_drift: recentAnomalies.filter(a => a.method === 'Gradual Drift'),
    statistical_outlier: recentAnomalies.filter(a => a.method === 'Z-Score'),
    trend_deviation: recentAnomalies.filter(a => a.method === 'Rolling Mean Deviation'),
    multi_sensor: correlationAnomalies
  };
  return { systemId, anomalies: recentAnomalies, correlations: correlationAnomalies, anomalyTypes, detectionMethods: methodCounts, latestReading: cleanedData[latestIndex] };
}

function calculateUnifiedRiskScore(detectionResult) {
  let totalScore = 0; let totalWeight = 0;
  Object.keys(detectionResult.detectionMethods).forEach(method => {
    const count = detectionResult.detectionMethods[method];
    const weight = METHOD_WEIGHTS[method] || 0.1;
    const methodAnomalies = detectionResult.anomalies.filter(a => a.method === method);
    let maxSeverity = 'LOW';
    methodAnomalies.forEach(a => { if (SEVERITY_SCORES[a.severity] > SEVERITY_SCORES[maxSeverity]) maxSeverity = a.severity; });
    totalScore += (SEVERITY_SCORES[maxSeverity] || 20) * weight * Math.min(count, 3);
    totalWeight += weight;
  });
  if (detectionResult.correlations.length > 0) {
    const maxCorr = detectionResult.correlations.reduce((max, c) => SEVERITY_SCORES[c.severity] > SEVERITY_SCORES[max.severity] ? c : max);
    totalScore += SEVERITY_SCORES[maxCorr.severity] * METHOD_WEIGHTS['Multi-Sensor Correlation'];
    totalWeight += METHOD_WEIGHTS['Multi-Sensor Correlation'];
  }
  return Math.min(Math.round(totalWeight > 0 ? totalScore / totalWeight : 0), 100);
}

function generateExplanation(types) {
  const exp = [];
  
  // Translate sensor patterns to equipment-level descriptions
  if (types.sudden_spike.length > 0) {
    const field = types.sudden_spike[0].field;
    if (field === 'temp') exp.push('Sudden thermal load increase');
    else if (field === 'pressure') exp.push('Abrupt pressure change');
    else if (field === 'vibration') exp.push('Sudden mechanical stress increase');
    else if (field === 'airflow') exp.push('Rapid airflow change');
    else if (field === 'power') exp.push('Power consumption spike');
    else exp.push('Sudden operational change in ' + field);
  }
  
  if (types.gradual_drift.length > 0) {
    const field = types.gradual_drift[0].field;
    const dir = types.gradual_drift[0].direction.toLowerCase();
    if (field === 'temp') exp.push('Progressive thermal ' + (dir === 'increasing' ? 'rise' : 'decline'));
    else if (field === 'pressure') exp.push('Gradual pressure ' + (dir === 'increasing' ? 'buildup' : 'loss'));
    else if (field === 'vibration') exp.push('Increasing mechanical stress');
    else if (field === 'airflow') exp.push('Declining airflow efficiency');
    else if (field === 'power') exp.push('Progressive power consumption change');
    else exp.push('Gradual performance drift in ' + field);
  }
  
  if (types.statistical_outlier.length > 0) {
    const field = types.statistical_outlier[0].field;
    if (field === 'temp') exp.push('Abnormal thermal operation');
    else if (field === 'pressure') exp.push('Unusual pressure conditions');
    else if (field === 'vibration') exp.push('Abnormal mechanical behavior');
    else if (field === 'airflow') exp.push('Atypical airflow pattern');
    else if (field === 'power') exp.push('Unusual power consumption');
    else exp.push('Abnormal ' + field + ' behavior');
  }
  
  if (types.multi_sensor.length > 0) {
    exp.push('Multiple system parameters affected simultaneously');
  }
  
  return exp.length > 0 ? exp.join('; ') : 'System operating normally';
}

function processSystemData(systemId, systemData) {
  const result = runHybridDetection(systemData, systemId);
  const riskScore = calculateUnifiedRiskScore(result);
  const severity = riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';
  const affectedMetrics = Array.from(new Set(result.anomalies.map(a => a.field)));
  return {
    systemId, systemName: { 'HVAC_1': 'Compressor Unit 1', 'HVAC_2': 'Cooling Tower 2', 'HVAC_3': 'Boiler System 3', 'HVAC_4': 'Air Handler Unit 4', 'HVAC_5': 'Chiller System 5' }[systemId] || systemId,
    timestamp: result.latestReading.timestamp, riskScore, severity, affectedMetrics,
    anomalyTypes: { sudden_spike: result.anomalyTypes.sudden_spike.length > 0, gradual_drift: result.anomalyTypes.gradual_drift.length > 0, statistical_outlier: result.anomalyTypes.statistical_outlier.length > 0, trend_deviation: result.anomalyTypes.trend_deviation.length > 0, multi_sensor: result.anomalyTypes.multi_sensor.length > 0 },
    detectionMethods: result.detectionMethods, explanation: generateExplanation(result.anomalyTypes),
    anomalyCount: result.anomalies.length, correlationCount: result.correlations.length,
    sensorData: { temperature: parseFloat(result.latestReading.temp), pressure: parseFloat(result.latestReading.pressure), airflow: parseFloat(result.latestReading.airflow), vibration: parseFloat(result.latestReading.vibration), power: parseFloat(result.latestReading.power) }
  };
}

async function getAllAlerts() {
  try {
    const mode = sensorDataSource.getMode();
    console.log(`📊 [DETECTION] Running anomaly detection (${mode} mode)...`);
    
    const rawData = await sensorDataSource.getSensorData();
    console.log(`✅ [DETECTION] Loaded ${rawData.length} readings`);
    
    const groupedData = groupBySystem(rawData);
    const alerts = [];
    for (const id in groupedData) alerts.push(processSystemData(id, groupedData[id]));
    alerts.sort((a, b) => b.riskScore - a.riskScore);
    console.log(`🚨 [DETECTION] Found ${alerts.filter(a => a.anomalyCount > 0).length} systems with anomalies`);
    return alerts;
  } catch (error) {
    console.error('❌ [DETECTION] Error:', error);
    throw error;
  }
}

module.exports = { getAllAlerts, processSystemData };
