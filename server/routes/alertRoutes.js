const express = require('express');
const router = express.Router();
const service = require('../services/anomalyDetectionService');

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await service.getAllAlerts();
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts', message: error.message });
  }
});

router.get('/alerts/stats', async (req, res) => {
  try {
    const alerts = await service.getAllAlerts();
    const stats = {
      total: alerts.length,
      bySeverity: {
        CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
        HIGH: alerts.filter(a => a.severity === 'HIGH').length,
        MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
        LOW: alerts.filter(a => a.severity === 'LOW').length
      },
      avgRiskScore: alerts.length > 0 ? Math.round(alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length) : 0
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alert statistics', message: error.message });
  }
});

module.exports = router;
