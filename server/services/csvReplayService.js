// CSV Replay Service - Existing CSV reading logic extracted
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cleaning = require('../utils/dataCleaningUtils');

/**
 * Read sensor data from CSV file
 */
function readSensorData() {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '../../assets/hvac_sensor_data.csv');
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (cleaning.validateSensorData(data)) {
          results.push(data);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Get sensor data (CSV replay mode)
 * Returns: Array of all sensor readings from CSV
 */
async function getSensorData() {
  return await readSensorData();
}

module.exports = {
  getSensorData,
  readSensorData
};
