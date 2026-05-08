const THRESHOLDS = { ZSCORE: 2.5, ROLLING_DEVIATION: 0.15, SPIKE_MULTIPLIER: 2.0, DRIFT_SLOPE: 0.05 };

function detectZScoreAnomalies(data, field, stats) {
  const anomalies = [];
  data.forEach((reading, index) => {
    const value = parseFloat(reading[field]);
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    if (zScore > THRESHOLDS.ZSCORE) {
      anomalies.push({ index: index, method: 'Z-Score', field: field, value: value, score: zScore, severity: zScore >= 4 ? 'CRITICAL' : zScore >= 3.5 ? 'HIGH' : zScore >= 3 ? 'MEDIUM' : 'LOW', timestamp: reading.timestamp });
    }
  });
  return anomalies;
}

function detectRollingMeanAnomalies(data, field, windowSize = 10) {
  const anomalies = [];
  if (data.length < windowSize) return anomalies;
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const windowValues = window.map(r => parseFloat(r[field]));
    const rollingMean = windowValues.reduce((a, b) => a + b, 0) / windowSize;
    const currentValue = parseFloat(data[i][field]);
    const deviation = Math.abs((currentValue - rollingMean) / rollingMean);
    if (deviation > THRESHOLDS.ROLLING_DEVIATION) {
      anomalies.push({ index: i, method: 'Rolling Mean Deviation', field: field, value: currentValue, rollingMean: rollingMean, deviation: deviation, severity: deviation >= 0.30 ? 'CRITICAL' : deviation >= 0.20 ? 'HIGH' : deviation >= 0.15 ? 'MEDIUM' : 'LOW', timestamp: data[i].timestamp });
    }
  }
  return anomalies;
}

function detectSuddenSpikes(data, field) {
  const anomalies = [];
  for (let i = 1; i < data.length; i++) {
    const prevValue = parseFloat(data[i - 1][field]);
    const currValue = parseFloat(data[i][field]);
    if (prevValue === 0) continue;
    const changeRatio = Math.abs((currValue - prevValue) / prevValue);
    if (changeRatio > THRESHOLDS.SPIKE_MULTIPLIER) {
      anomalies.push({ index: i, method: 'Sudden Spike', field: field, value: currValue, previousValue: prevValue, changeRatio: changeRatio, severity: changeRatio >= 3.0 ? 'CRITICAL' : changeRatio >= 2.5 ? 'HIGH' : changeRatio >= 2.0 ? 'MEDIUM' : 'LOW', timestamp: data[i].timestamp });
    }
  }
  return anomalies;
}

function detectGradualDrift(data, field, windowSize = 20) {
  const anomalies = [];
  if (data.length < windowSize) return anomalies;
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const values = window.map(r => parseFloat(r[field]));
    const slope = calculateSlope(values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const normalizedSlope = Math.abs(slope / avgValue);
    if (normalizedSlope > THRESHOLDS.DRIFT_SLOPE) {
      anomalies.push({ index: i, method: 'Gradual Drift', field: field, slope: slope, normalizedSlope: normalizedSlope, direction: slope > 0 ? 'INCREASING' : 'DECREASING', severity: normalizedSlope >= 0.10 ? 'CRITICAL' : normalizedSlope >= 0.07 ? 'HIGH' : normalizedSlope >= 0.05 ? 'MEDIUM' : 'LOW', timestamp: data[i].timestamp });
    }
  }
  return anomalies;
}

function detectMultiSensorCorrelation(allAnomalies, sensorFields) {
  const correlatedAnomalies = [];
  const anomaliesByTime = {};
  allAnomalies.forEach(anomaly => {
    const time = anomaly.timestamp;
    if (!anomaliesByTime[time]) anomaliesByTime[time] = [];
    anomaliesByTime[time].push(anomaly);
  });
  Object.keys(anomaliesByTime).forEach(time => {
    const timeAnomalies = anomaliesByTime[time];
    const affectedFields = new Set(timeAnomalies.map(a => a.field));
    if (affectedFields.size >= 2) {
      const correlationScore = affectedFields.size / sensorFields.length;
      correlatedAnomalies.push({ method: 'Multi-Sensor Correlation', timestamp: time, affectedMetrics: Array.from(affectedFields), anomalyCount: timeAnomalies.length, correlationScore: correlationScore, severity: correlationScore >= 0.8 ? 'CRITICAL' : correlationScore >= 0.6 ? 'HIGH' : correlationScore >= 0.4 ? 'MEDIUM' : 'LOW', details: timeAnomalies });
    }
  });
  return correlatedAnomalies;
}

function calculateSlope(values) {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  return denominator !== 0 ? numerator / denominator : 0;
}

module.exports = { detectZScoreAnomalies, detectRollingMeanAnomalies, detectSuddenSpikes, detectGradualDrift, detectMultiSensorCorrelation, THRESHOLDS };
