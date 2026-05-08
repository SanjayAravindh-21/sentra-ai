// Real-Time Sensor Service - Simulates live HVAC sensor streaming
// Generates realistic sensor data with natural fluctuations and anomaly injection

class RealtimeSensorService {
  constructor() {
    this.systems = {
      'HVAC_1': { name: 'Compressor Unit 1', type: 'compressor' },
      'HVAC_2': { name: 'Cooling Tower 2', type: 'cooling_tower' },
      'HVAC_3': { name: 'Boiler System 3', type: 'boiler' },
      'HVAC_4': { name: 'Air Handler Unit 4', type: 'air_handler' },
      'HVAC_5': { name: 'Chiller System 5', type: 'chiller' }
    };

    // Historical data buffer (keep last 100 readings per system)
    this.history = {};
    this.HISTORY_SIZE = 100;

    // Anomaly injection state
    this.anomalyState = {};
    
    // Base sensor ranges for each HVAC type
    this.sensorBaselines = {
      compressor: {
        temp: { base: 75, range: 10, unit: '°F' },
        pressure: { base: 2.5, range: 0.5, unit: 'bar' },
        airflow: { base: 450, range: 50, unit: 'CFM' },
        vibration: { base: 0.035, range: 0.015, unit: 'g' },
        power: { base: 5.5, range: 1.0, unit: 'kW' }
      },
      cooling_tower: {
        temp: { base: 68, range: 8, unit: '°F' },
        pressure: { base: 1.8, range: 0.4, unit: 'bar' },
        airflow: { base: 380, range: 40, unit: 'CFM' },
        vibration: { base: 0.028, range: 0.012, unit: 'g' },
        power: { base: 4.2, range: 0.8, unit: 'kW' }
      },
      boiler: {
        temp: { base: 180, range: 20, unit: '°F' },
        pressure: { base: 3.2, range: 0.6, unit: 'bar' },
        airflow: { base: 320, range: 35, unit: 'CFM' },
        vibration: { base: 0.042, range: 0.018, unit: 'g' },
        power: { base: 7.8, range: 1.5, unit: 'kW' }
      },
      air_handler: {
        temp: { base: 72, range: 12, unit: '°F' },
        pressure: { base: 2.1, range: 0.4, unit: 'bar' },
        airflow: { base: 520, range: 60, unit: 'CFM' },
        vibration: { base: 0.031, range: 0.013, unit: 'g' },
        power: { base: 6.1, range: 1.2, unit: 'kW' }
      },
      chiller: {
        temp: { base: 42, range: 6, unit: '°F' },
        pressure: { base: 2.8, range: 0.5, unit: 'bar' },
        airflow: { base: 410, range: 45, unit: 'CFM' },
        vibration: { base: 0.038, range: 0.016, unit: 'g' },
        power: { base: 8.5, range: 1.8, unit: 'kW' }
      }
    };

    this.updateCount = 0;
    this.initialized = false;
  }

  /**
   * Initialize the real-time sensor service
   */
  initialize() {
    if (this.initialized) return;

    console.log('🚀 [REALTIME] Initializing sensor simulation...');
    
    // Initialize history and state for each system
    Object.keys(this.systems).forEach(systemId => {
      this.history[systemId] = [];
      this.anomalyState[systemId] = {
        activeAnomaly: null,
        anomalyProgress: 0,
        lastAnomalyTime: 0,
        driftDirection: null,
        driftMagnitude: 0,
        targetField: null
      };

      // Generate initial historical data (50 readings)
      const systemType = this.systems[systemId].type;
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(Date.now() - (50 - i) * 60000); // 1 min intervals
        const reading = this.generateNormalReading(systemId, systemType, timestamp);
        this.history[systemId].push(reading);
      }
    });

    this.initialized = true;
    console.log(`✅ [REALTIME] Initialized 5 systems with 50 historical readings each`);
  }

  /**
   * Generate a normal (non-anomalous) sensor reading
   */
  generateNormalReading(systemId, systemType, timestamp) {
    const baselines = this.sensorBaselines[systemType];
    
    return {
      timestamp: timestamp.toISOString().split('.')[0].replace('T', ' '),
      unit_id: systemId,
      temp: this.addNoise(baselines.temp.base, baselines.temp.range * 0.15).toFixed(1),
      pressure: this.addNoise(baselines.pressure.base, baselines.pressure.range * 0.1).toFixed(4),
      airflow: this.addNoise(baselines.airflow.base, baselines.airflow.range * 0.12).toFixed(2),
      vibration: this.addNoise(baselines.vibration.base, baselines.vibration.range * 0.15).toFixed(6),
      power: this.addNoise(baselines.power.base, baselines.power.range * 0.1).toFixed(3)
    };
  }

  /**
   * Add natural noise to a value
   */
  addNoise(base, range) {
    return base + (Math.random() - 0.5) * 2 * range;
  }

  /**
   * Check if it's time to inject an anomaly
   */
  shouldInjectAnomaly(systemId) {
    const state = this.anomalyState[systemId];
    const now = Date.now();
    
    // If anomaly is active, continue it
    if (state.activeAnomaly) return true;
    
    // Inject new anomaly every 2-5 minutes (probabilistic)
    const timeSinceLastAnomaly = now - state.lastAnomalyTime;
    const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes
    
    if (timeSinceLastAnomaly > MIN_INTERVAL) {
      // 10% chance per update cycle (averages to ~3 min)
      if (Math.random() < 0.1) {
        this.initializeAnomaly(systemId);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Initialize a new anomaly
   */
  initializeAnomaly(systemId) {
    const anomalyTypes = ['sudden_spike', 'gradual_drift', 'multi_sensor'];
    const fields = ['temp', 'pressure', 'airflow', 'vibration', 'power'];
    
    const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const targetField = fields[Math.floor(Math.random() * fields.length)];
    
    this.anomalyState[systemId] = {
      activeAnomaly: type,
      anomalyProgress: 0,
      lastAnomalyTime: Date.now(),
      driftDirection: Math.random() > 0.5 ? 'up' : 'down',
      driftMagnitude: 0.15 + Math.random() * 0.25, // 15-40% deviation
      targetField: targetField,
      duration: type === 'gradual_drift' ? 25 : 1 // readings
    };

    console.log(`⚠️ [REALTIME] Anomaly injected: ${systemId} - ${type} on ${targetField}`);
  }

  /**
   * Generate anomalous reading
   */
  generateAnomalousReading(systemId, systemType, timestamp) {
    const state = this.anomalyState[systemId];
    const reading = this.generateNormalReading(systemId, systemType, timestamp);
    
    if (state.activeAnomaly === 'sudden_spike') {
      // Sudden spike: 2-3x normal value
      const multiplier = 2 + Math.random();
      reading[state.targetField] = (parseFloat(reading[state.targetField]) * multiplier).toFixed(
        state.targetField === 'temp' ? 1 :
        state.targetField === 'pressure' ? 4 :
        state.targetField === 'airflow' ? 2 :
        state.targetField === 'vibration' ? 6 : 3
      );
      
      // Spike lasts 1 reading
      state.activeAnomaly = null;
      
    } else if (state.activeAnomaly === 'gradual_drift') {
      // Gradual drift: slowly increase/decrease over 25 readings
      state.anomalyProgress++;
      const driftFactor = (state.anomalyProgress / state.duration) * state.driftMagnitude;
      const direction = state.driftDirection === 'up' ? 1 : -1;
      
      const currentValue = parseFloat(reading[state.targetField]);
      const driftedValue = currentValue * (1 + direction * driftFactor);
      
      reading[state.targetField] = driftedValue.toFixed(
        state.targetField === 'temp' ? 1 :
        state.targetField === 'pressure' ? 4 :
        state.targetField === 'airflow' ? 2 :
        state.targetField === 'vibration' ? 6 : 3
      );
      
      // End drift after duration
      if (state.anomalyProgress >= state.duration) {
        state.activeAnomaly = null;
        console.log(`✓ [REALTIME] Drift completed: ${systemId}`);
      }
      
    } else if (state.activeAnomaly === 'multi_sensor') {
      // Multi-sensor correlation: affect 2-3 sensors simultaneously
      const fields = ['temp', 'pressure', 'vibration'];
      fields.forEach(field => {
        const multiplier = 1.5 + Math.random() * 0.5;
        reading[field] = (parseFloat(reading[field]) * multiplier).toFixed(
          field === 'temp' ? 1 :
          field === 'pressure' ? 4 : 6
        );
      });
      
      // Multi-sensor lasts 1 reading
      state.activeAnomaly = null;
    }
    
    return reading;
  }

  /**
   * Generate next sensor reading for a system
   */
  generateNextReading(systemId) {
    const systemType = this.systems[systemId].type;
    const timestamp = new Date();
    
    let reading;
    if (this.shouldInjectAnomaly(systemId)) {
      reading = this.generateAnomalousReading(systemId, systemType, timestamp);
    } else {
      reading = this.generateNormalReading(systemId, systemType, timestamp);
    }
    
    // Add to history
    this.history[systemId].push(reading);
    
    // Maintain history size
    if (this.history[systemId].length > this.HISTORY_SIZE) {
      this.history[systemId].shift();
    }
    
    return reading;
  }

  /**
   * Get sensor data for all systems (called by API)
   * Returns: Array of sensor readings (last 50 per system)
   */
  async getSensorData() {
    if (!this.initialized) {
      this.initialize();
    }

    // Generate new readings for all systems
    Object.keys(this.systems).forEach(systemId => {
      this.generateNextReading(systemId);
    });

    this.updateCount++;
    
    // Flatten history to match CSV format
    const allReadings = [];
    Object.keys(this.history).forEach(systemId => {
      // Return last 50 readings per system for anomaly detection
      allReadings.push(...this.history[systemId].slice(-50));
    });

    console.log(`🔄 [REALTIME] Update ${this.updateCount}: Generated ${allReadings.length} readings`);
    
    return allReadings;
  }

  /**
   * Get statistics (for debugging/monitoring)
   */
  getStats() {
    return {
      updateCount: this.updateCount,
      historySize: Object.keys(this.history).reduce((sum, id) => sum + this.history[id].length, 0),
      activeAnomalies: Object.keys(this.anomalyState).filter(id => this.anomalyState[id].activeAnomaly).length
    };
  }
}

// Singleton instance
const instance = new RealtimeSensorService();

module.exports = instance;
