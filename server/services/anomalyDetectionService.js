const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cleaning = require('../utils/dataCleaningUtils');

const SENSOR_FIELDS = ['temp', 'pressure', 'airflow', 'vibration', 'power'];
const ZSCORE_THRESHOLD = 2.5;

function readSensorData() {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '../../assets/hvac_sensor_data.csv');
    fs.createReadStream(csvPath).pipe(csv()).on('data', (data) => {
      if (cleaning.validateSensorData(data)) results.push(data);
    }).on('end', () => resolve(results)).on('error', reject);
  });
}

function groupBySystem(data) {
  return data.reduce((acc, row) => {
    const systemId = row.unit_id;
    if (!acc[systemId]) acc[systemId] = [];
    acc[systemId].push(row);
    return acc;
  }, {});
}

function detectAnomaliesInReading(reading) {
  const anomalies = [];
  SENSOR_FIELDS.forEach(field => {
    const zScoreKey = field + '_zscore';
    const zScore = reading.zScores[zScoreKey];
    if (zScore > ZSCORE_THRESHOLD) {
      anomalies.push({
        sensorType: field,
        value: parseFloat(reading[field]),
        zScore: Math.round(zScore * 100) / 100,
        severity: determineSeverity(zScore),
        timestamp: reading.timestamp
      });
    }
  });
  return anomalies;
}

function determineSeverity(zScore) {
  const absZScore = Math.abs(zScore);
  if (absZScore >= 4) return 'CRITICAL';
  if (absZScore >= 3.5) return 'HIGH';
  if (absZScore >= 3) return 'MEDIUM';
  return 'LOW';
}

function calculateRiskScore(anomalies) {
  if (anomalies.length === 0) return 0;
  const weights = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 };
  let totalScore = 0;
  anomalies.forEach(a => { totalScore += weights[a.severity]; });
  if (anomalies.length > 1) totalScore += 10 * (anomalies.length - 1);
  return Math.min(Math.round(totalScore), 100);
}

function processSystemData(systemId, systemData) {
  const cleanedData = cleaning.handleMissingValues(systemData, SENSOR_FIELDS);
  const dataWithZScores = cleaning.calculateZScores(cleanedData, SENSOR_FIELDS);
  const latestReading = dataWithZScores[dataWithZScores.length - 1];
  const anomalies = detectAnomaliesInReading(latestReading);
  const riskScore = calculateRiskScore(anomalies);
  const overallSeverity = anomalies.length > 0 ? anomalies.reduce((max, a) => {
    const order = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    return order[a.severity] > order[max] ? a.severity : max;
  }, 'LOW') : null;
  return {
    systemId,
    systemName: getSystemName(systemId),
    timestamp: latestReading.timestamp,
    riskScore,
    severity: overallSeverity,
    anomalies,
    sensorData: {
      temperature: parseFloat(latestReading.temp),
      pressure: parseFloat(latestReading.pressure),
      airflow: parseFloat(latestReading.airflow),
      vibration: parseFloat(latestReading.vibration),
      power: parseFloat(latestReading.power)
    }
  };
}

function getSystemName(systemId) {
  const map = {
    'HVAC_1': 'Compressor Unit 1',
    'HVAC_2': 'Cooling Tower 2',
    'HVAC_3': 'Boiler System 3',
    'HVAC_4': 'Air Handler Unit 4',
    'HVAC_5': 'Chiller System 5'
  };
  return map[systemId] || systemId;
}

async function getAllAlerts() {
  try {
    console.log('Reading sensor data...');
    const rawData = await readSensorData();
    console.log('Loaded ' + rawData.length + ' sensor readings');
    const groupedData = groupBySystem(rawData);
    console.log('Processing ' + Object.keys(groupedData).length + ' HVAC systems');
    const alerts = [];
    for (const systemId in groupedData) {
      const processedData = processSystemData(systemId, groupedData[systemId]);
      if (processedData.anomalies.length > 0) alerts.push(processedData);
    }
    alerts.sort((a, b) => b.riskScore - a.riskScore);
    console.log('Found ' + alerts.length + ' systems with anomalies');
    return alerts;
  } catch (error) {
    console.error('Error processing sensor data:', error);
    throw error;
  }
}

module.exports = { getAllAlerts, readSensorData, processSystemData };
