const express = require('express');
const cors = require('cors');
const path = require('path');
const alertRoutes = require('./routes/alertRoutes');

let enhancedAlertRoutes;
try {
  enhancedAlertRoutes = require('./routes/enhancedAlertRoutes');
  console.log('✅ Enhanced routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load enhanced routes:', error.message);
  enhancedAlertRoutes = alertRoutes; // Fallback
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(timestamp + ' - ' + req.method + ' ' + req.path);
  next();
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'HVAC Anomaly Detection API (Enhanced Hybrid) is running', timestamp: new Date().toISOString() });
});

app.use('/api', enhancedAlertRoutes);
app.use('/api/v1', alertRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('=== ENHANCED HYBRID DETECTION API ===');
  console.log('API Endpoints:');
  console.log('  - GET /health');
  console.log('  - GET /api/alerts (hybrid detection)');
  console.log('  - GET /api/alerts/stats (enhanced stats)');
  console.log('  - GET /api/alerts/detection-methods (method info)');
  console.log('  - GET /api/v1/alerts (original Z-score)');
  console.log('Detection Methods: Z-Score, Rolling Mean, Spike, Drift, Correlation');
  console.log('Press Ctrl+C to stop');
});

module.exports = app;
