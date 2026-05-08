# Data Flow & Architecture Documentation

## 📊 Sensor Data Source

### Where does the data come from?

**Yes, it only comes from the CSV file!**

**Location:** `assets/hvac_sensor_data.csv`

**Backend reads it here:**
- `server/services/enhancedAnomalyDetectionService.js` (line 14)
- Path: `path.join(__dirname, ''../../assets/hvac_sensor_data.csv'')`

### If you change the CSV file, will it show different results?

**YES! Here''s how it works:**

1. **Change CSV Data** → Edit `assets/hvac_sensor_data.csv`
2. **Backend Reads Fresh Data** → Every API call reads the CSV file from disk
3. **New Analysis** → Anomaly detection runs on the new data
4. **Different Results** → Frontend displays the new anomalies

**Example:**
```csv
# Before:
HVAC_1,2024-01-01,22.5,101.5,850,0.08,7.2

# After (higher vibration = anomaly):
HVAC_1,2024-01-01,22.5,101.5,850,5.5,7.2
```

The backend will detect the high vibration and create a new alert!

## 🏗️ Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  HVAC MONITORING SYSTEM                      │
└─────────────────────────────────────────────────────────────┘

1️⃣  DATA SOURCE
    assets/hvac_sensor_data.csv
    ├─ Columns: unit_id, timestamp, temp, pressure, airflow, vibration, power
    ├─ 5 HVAC systems (HVAC_1 to HVAC_5)
    └─ ~200 readings per system (1000 total rows)

          ↓ Backend reads CSV on each API request

2️⃣  BACKEND ANOMALY DETECTION
    server/services/enhancedAnomalyDetectionService.js
    
    A. Data Loading & Cleaning
       • Read CSV with csv-parser
       • Validate sensor data
       • Handle missing values
       • Group by system (unit_id)
    
    B. Hybrid Detection (5 Methods)
       ├─ Z-Score (25% weight)
       │  • Detects statistical outliers (>2.5 std dev)
       │
       ├─ Rolling Mean (20% weight)
       │  • Detects deviation from 10-reading average
       │
       ├─ Sudden Spike (25% weight)
       │  • Detects 2x instant changes
       │
       ├─ Gradual Drift (15% weight)
       │  • Detects trending changes over 20 readings
       │
       └─ Multi-Sensor Correlation (15% weight)
          • Detects when 2+ sensors anomalous together
    
    C. Risk Scoring
       • Weighted combination of all methods
       • Scale: 0-100 (100 = critical)
       • Severity: LOW/MEDIUM/HIGH/CRITICAL
    
    D. Alert Generation
       • Create alert for each system
       • Include affected sensors
       • Include anomaly types
       • Include latest sensor readings

          ↓ Alerts sent to AI service

3️⃣  AI EXPLANATION SERVICE (BACKEND)
    server/services/aiExplanationService.js
    
    A. Smart AI Usage
       • Only for risk score >= 40
       • Low-risk alerts use rule-based fallback
    
    B. 5-Minute Cache
       • Key: systemId + riskScore + affectedMetrics
       • Reduces redundant Gemini calls
       • Fast responses for repeated requests
    
    C. Gemini API Call
       • Model: gemini-2.0-flash-lite
       • Prompt includes: system name, risk score, anomaly types, affected sensors
       • Returns JSON: { summary, possibleCause, recommendedAction }
    
    D. Retry & Fallback
       • 2 retries with exponential backoff
       • Falls back to rule-based on failure
       • Never fails - always returns explanation

          ↓ Enhanced alerts ready

4️⃣  API RESPONSE
    GET /api/alerts
    
    Returns:
    {
      "success": true,
      "count": 5,
      "data": [
        {
          "systemId": "HVAC_1",
          "systemName": "Compressor Unit 1",
          "riskScore": 85,
          "severity": "CRITICAL",
          "affectedMetrics": ["vibration", "temp"],
          "aiExplanation": {
            "summary": "Critical vibration spike detected",
            "possibleCause": "Likely bearing failure",
            "recommendedAction": "Immediate inspection required"
          },
          "sensorData": { ... },
          ...
        }
      ]
    }

          ↓ Frontend receives enhanced data

5️⃣  FRONTEND DISPLAY
    src/features/alerts/services/apiService.ts
    
    A. Request Deduplication
       • Prevents duplicate concurrent requests
       • React re-renders reuse pending request
    
    B. 10-Second Cache
       • Frontend caches API responses
       • Reduces backend load
       • Fast navigation
    
    C. Display
       • DashboardScreen shows all alerts
       • AlertDetailScreen shows full details
       • AI explanations displayed with 🤖 icon
```

## 🔄 How to Test Changes

### Method 1: Modify CSV Data

1. Open `assets/hvac_sensor_data.csv`
2. Change sensor values (e.g., increase vibration from 0.08 to 5.5)
3. Save the file
4. Refresh frontend (http://localhost:8081)
5. Backend reads new CSV → New anomalies detected!

### Method 2: Add New Systems

1. Add new rows to CSV with new `unit_id`:
```csv
HVAC_6,2024-01-01,25.0,105.0,900,0.1,8.0
HVAC_6,2024-01-01,25.2,104.8,895,0.09,8.1
...
```
2. Backend will automatically detect the new system
3. Frontend will display 6 alerts instead of 5

### Method 3: Create Specific Anomaly Patterns

**Sudden Spike:**
```csv
HVAC_1,2024-01-01,22.5,101.5,850,0.08,7.2  # Normal
HVAC_1,2024-01-02,22.6,101.4,855,0.09,7.3  # Normal
HVAC_1,2024-01-03,22.7,101.6,860,5.5,7.4   # SPIKE! (vibration 0.09 → 5.5)
```

**Gradual Drift:**
```csv
HVAC_2,2024-01-01,22.0,101.0,850,0.08,7.0  # Baseline
HVAC_2,2024-01-02,22.5,101.0,850,0.08,7.0  # +0.5°C
HVAC_2,2024-01-03,23.0,101.0,850,0.08,7.0  # +1.0°C (drifting up)
HVAC_2,2024-01-04,23.5,101.0,850,0.08,7.0  # +1.5°C
HVAC_2,2024-01-05,24.0,101.0,850,0.08,7.0  # +2.0°C (DRIFT DETECTED!)
```

## 🚨 Important Notes

1. **No Database** - All data is from CSV only
2. **No Real-Time Streaming** - CSV is read on each API request
3. **Backend Processes Everything** - Frontend just displays
4. **AI Calls Backend Only** - Never from frontend (secure!)
5. **Caching at Multiple Levels**:
   - Backend: 5-minute AI explanation cache
   - Frontend: 10-second API response cache

## 🔧 Troubleshooting

**Q: I changed the CSV but don''t see new data?**
A: Make sure you saved the file. Backend reads from disk on each request.

**Q: How often does it check the CSV?**
A: Every time frontend calls /api/alerts (every 30 seconds auto-refresh + manual refresh)

**Q: Can I add more HVAC systems?**
A: Yes! Just add new rows with new unit_id values.

**Q: Where is the AI API key?**
A: Backend only (`server/services/aiExplanationService.js`). Never in frontend code.

---

**Architecture Summary:**
```
CSV → Backend Detection → Backend AI → Frontend Display
     (1000 readings)  (5 methods)    (Gemini)    (React)
```
