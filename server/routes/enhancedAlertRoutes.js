const express = require('express');
const router = express.Router();
const enhancedService = require('../services/enhancedAnomalyDetectionService');
const aiService = require('../services/aiExplanationService');

router.get('/alerts', async (req, res) => {
  const startTime = Date.now();
  console.log('🔥 [API] /api/alerts called - processing alerts...');
  try {
    const alerts = await enhancedService.getAllAlerts();
    console.log(`✅ [API] Enhanced service returned ${alerts.length} alerts`);
    
    // Enhance alerts with AI explanations (parallel processing for speed)
    const enhancedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        if (alert.riskScore >= 40) {
          try {
            const aiExplanation = await aiService.generateExplanation(alert);
            return { ...alert, aiExplanation };
          } catch (error) {
            console.error(`❌ [API] AI failed for ${alert.systemName}: ${error.message}`);
            return alert;
          }
        }
        return alert;
      })
    );
    
    const duration = Date.now() - startTime;
    const onlyAnomalies = req.query.onlyAnomalies === 'true';
    const filteredAlerts = onlyAnomalies ? enhancedAlerts.filter(a => a.anomalyCount > 0) : enhancedAlerts;
    
    console.log(`⏱️ [API] Request completed in ${duration}ms (${filteredAlerts.length} alerts returned)`);
    
    res.json({
      success: true,
      count: filteredAlerts.length,
      totalSystems: alerts.length,
      data: filteredAlerts,
      detectionInfo: {
        methods: ['Z-Score', 'Rolling Mean', 'Sudden Spike', 'Gradual Drift', 'Multi-Sensor Correlation'],
        hybrid: true
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [API] Error after ${duration}ms:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts', message: error.message });
  }
});

router.get('/alerts/stats', async (req, res) => {
  try {
    const alerts = await enhancedService.getAllAlerts();
    const stats = {
      total: alerts.length,
      withAnomalies: alerts.filter(a => a.anomalyCount > 0).length,
      bySeverity: {
        CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
        HIGH: alerts.filter(a => a.severity === 'HIGH').length,
        MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
        LOW: alerts.filter(a => a.severity === 'LOW').length
      },
      byAnomalyType: {
        sudden_spike: alerts.filter(a => a.anomalyTypes.sudden_spike).length,
        gradual_drift: alerts.filter(a => a.anomalyTypes.gradual_drift).length,
        statistical_outlier: alerts.filter(a => a.anomalyTypes.statistical_outlier).length,
        trend_deviation: alerts.filter(a => a.anomalyTypes.trend_deviation).length,
        multi_sensor: alerts.filter(a => a.anomalyTypes.multi_sensor).length
      },
      avgRiskScore: alerts.length > 0 ? Math.round(alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length) : 0,
      totalAnomalies: alerts.reduce((sum, a) => sum + a.anomalyCount, 0)
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats', message: error.message });
  }
});

router.get('/alerts/detection-methods', (req, res) => {
  res.json({
    success: true,
    data: {
      methods: [
        { name: 'Z-Score', description: 'Statistical detection', threshold: '2.5 std dev', weight: 0.25 },
        { name: 'Rolling Mean Deviation', description: 'Recent average deviation', threshold: '15%', weight: 0.20 },
        { name: 'Sudden Spike', description: 'Abrupt changes', threshold: '2x change', weight: 0.25 },
        { name: 'Gradual Drift', description: 'Trending changes', threshold: '5% slope', weight: 0.15 },
        { name: 'Multi-Sensor Correlation', description: 'Multiple sensors', threshold: '2+ sensors', weight: 0.15 }
      ],
      riskScoreCalculation: 'Weighted combination',
      severityLevels: ['LOW (0-24)', 'MEDIUM (25-49)', 'HIGH (50-74)', 'CRITICAL (75-100)']
    }
  });
});

// Sensor Mode Control Endpoints
router.get('/sensor/mode', (req, res) => {
  const sensorDataSource = require('../services/sensorDataSource');
  const realtimeSensorService = require('../services/realtimeSensorService');
  
  const mode = sensorDataSource.getMode();
  const stats = mode === 'realtime' ? realtimeSensorService.getStats() : null;
  
  res.json({
    success: true,
    data: {
      currentMode: mode,
      availableModes: ['csv', 'realtime'],
      description: mode === 'csv' 
        ? 'Using static CSV data replay' 
        : 'Using real-time sensor simulation',
      realtimeStats: stats
    }
  });
});

router.post('/sensor/mode', (req, res) => {
  const sensorDataSource = require('../services/sensorDataSource');
  const { mode } = req.body;
  
  if (!mode || (mode !== 'csv' && mode !== 'realtime')) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid mode. Use "csv" or "realtime"' 
    });
  }
  
  try {
    sensorDataSource.switchMode(mode);
    res.json({ 
      success: true, 
      message: `Sensor mode switched to ${mode}`,
      newMode: mode
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
