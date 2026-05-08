# Real-Time Sensor Streaming Implementation Plan

## Architecture

\\\
┌─────────────────────────────────────┐
│   Frontend (No Changes Needed)     │
│   GET /api/alerts every 60s         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   enhancedAnomalyDetectionService   │
│   (uses abstraction layer)          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      sensorDataSource.js            │
│      (abstraction interface)        │
└─────────┬───────────────┬───────────┘
          │               │
┌─────────▼─────┐  ┌──────▼──────────┐
│ csvReplay     │  │ realtimeSensor  │
│ Service.js    │  │ Service.js      │
│               │  │                 │
│ - Read CSV    │  │ - Generate live │
│ - Static data │  │ - Inject        │
│               │  │   anomalies     │
│               │  │ - State machine │
└───────────────┘  └─────────────────┘
\\\

## Implementation Steps

1. ✅ Create sensorDataSource.js (abstraction)
2. ✅ Create csvReplayService.js (extract existing)
3. ✅ Create realtimeSensorService.js (NEW)
4. ✅ Modify enhancedAnomalyDetectionService.js
5. ✅ Add MODE env variable
6. ✅ Test both modes

## Features

### CSV Replay Mode
- Loads static CSV data
- Deterministic results
- Good for testing

### Real-Time Mode  
- Generates live sensor readings
- Natural fluctuations (±2-5%)
- Anomaly injection every 2-5 minutes
- Gradual drifts over 20-30 readings
- Sudden spikes randomly
- Multi-sensor correlations

## Configuration

Add to server/.env:
SENSOR_MODE=realtime  # or 'csv'
