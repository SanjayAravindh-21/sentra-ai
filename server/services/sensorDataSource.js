// Sensor Data Source Abstraction Layer
// Provides unified interface for CSV replay and real-time streaming

const csvReplayService = require('./csvReplayService');
const realtimeSensorService = require('./realtimeSensorService');

let activeDataSource;

function getCurrentMode() {
  return process.env.SENSOR_MODE || 'csv';
}

function initializeDataSource() {
  const mode = getCurrentMode();
  
  if (mode === 'realtime') {
    console.log('🌊 [SENSOR] Real-time streaming mode enabled');
    activeDataSource = realtimeSensorService;
    realtimeSensorService.initialize();
  } else {
    console.log('📁 [SENSOR] CSV replay mode enabled');
    activeDataSource = csvReplayService;
  }
}

async function getSensorData() {
  if (!activeDataSource) {
    initializeDataSource();
  }
  
  return await activeDataSource.getSensorData();
}

function getMode() {
  return getCurrentMode();
}

function switchMode(newMode) {
  if (newMode !== 'csv' && newMode !== 'realtime') {
    throw new Error('Invalid mode. Use "csv" or "realtime"');
  }
  
  process.env.SENSOR_MODE = newMode;
  activeDataSource = null; // Clear active source
  console.log(`🔄 [SENSOR] Switched to ${newMode} mode`);
  
  // Immediately initialize the new mode
  initializeDataSource();
}

module.exports = {
  getSensorData,
  getMode,
  switchMode,
  initializeDataSource
};
