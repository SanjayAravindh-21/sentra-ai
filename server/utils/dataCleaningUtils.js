function handleMissingValues(data, numericFields) {
  const means = {};
  numericFields.forEach(field => {
    const validValues = data.map(row => parseFloat(row[field])).filter(val => !isNaN(val));
    means[field] = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
  });
  return data.map(row => {
    const cleanedRow = Object.assign({}, row);
    numericFields.forEach(field => {
      const value = parseFloat(row[field]);
      if (isNaN(value) || row[field] === '' || row[field] === null) {
        cleanedRow[field] = means[field];
      } else {
        cleanedRow[field] = value;
      }
    });
    return cleanedRow;
  });
}

function normalizeData(data, numericFields) {
  const normalizationParams = {};
  numericFields.forEach(field => {
    const values = data.map(row => parseFloat(row[field]));
    normalizationParams[field] = { min: Math.min(...values), max: Math.max(...values) };
  });
  const normalizedData = data.map(row => {
    const normalizedRow = Object.assign({}, row);
    numericFields.forEach(field => {
      const params = normalizationParams[field];
      const range = params.max - params.min;
      normalizedRow[field + '_normalized'] = range > 0 ? (parseFloat(row[field]) - params.min) / range : 0;
    });
    return normalizedRow;
  });
  return { normalizedData, normalizationParams };
}

function calculateZScores(data, numericFields) {
  const stats = {};
  numericFields.forEach(field => {
    const values = data.map(row => parseFloat(row[field]));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    stats[field] = { mean, stdDev };
  });
  return data.map(row => {
    const zScores = {};
    numericFields.forEach(field => {
      const value = parseFloat(row[field]);
      const stat = stats[field];
      zScores[field + '_zscore'] = stat.stdDev > 0 ? Math.abs((value - stat.mean) / stat.stdDev) : 0;
    });
    return Object.assign({}, row, { zScores });
  });
}

function validateSensorData(row) {
  return row.timestamp && row.unit_id;
}

module.exports = { handleMissingValues, normalizeData, calculateZScores, validateSensorData };
