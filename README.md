# 🏭 HVAC Monitor - AI-Powered Anomaly Detection

A production-ready React Native mobile application for real-time HVAC system monitoring with intelligent anomaly detection and AI-powered explanations.

> **🚀 [Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in under 5 minutes!

---

## 🎯 Overview

This system monitors HVAC equipment in real-time, detects anomalies using hybrid statistical methods, and provides actionable maintenance recommendations through AI-generated explanations.

**Key Features:**
- 📊 **Hybrid Anomaly Detection** - 5 statistical methods combined
- 🤖 **AI Explanations** - Gemini + Groq fallback for contextual insights
- 📱 **Mobile-First** - React Native app (iOS/Android)  
- 🌊 **Real-Time Streaming** - Live sensor simulation with dynamic anomalies
- ⚡ **High Performance** - Sub-second response times with intelligent caching

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile App (React Native)              │
│                                                          │
│  • Dashboard with alert prioritization                  │
│  • Detail screens with AI explanations                  │
│  • Auto-refresh every 60 seconds                        │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────────┐
│                   Backend (Node.js/Express)              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Sensor Data Layer                                │  │
│  │  • CSV Replay (historical)                        │  │
│  │  • Real-Time Simulation (live)                    │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                            │
│  ┌──────────▼───────────────────────────────────────┐  │
│  │  Anomaly Detection Engine                         │  │
│  │  • Z-Score                                        │  │
│  │  • Rolling Mean Deviation                         │  │
│  │  • Sudden Spike Detection                         │  │
│  │  • Gradual Drift Tracking                         │  │
│  │  • Multi-Sensor Correlation                       │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                            │
│  ┌──────────▼───────────────────────────────────────┐  │
│  │  AI Explanation Layer (3-tier)                    │  │
│  │  1. Gemini 2.0 Flash Lite (primary)               │  │
│  │  2. Groq Llama 3.1 8B (fallback)                  │  │
│  │  3. Rule-based (last resort)                      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Mobile device with Expo Go app (or iOS Simulator / Android Emulator)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hvac-monitor.git
   cd hvac-monitor
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your API keys
   ```

4. **Start the backend server**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3000
   ```

5. **Start the mobile app**
   ```bash
   # In root directory
   npx expo start
   # Scan QR code with Expo Go app
   ```

---

## 🔧 Configuration

### Environment Variables

**Backend (`server/.env`):**

```env
# AI API Keys
GEMINI_API_KEY=your_gemini_api_key          # Get from: https://ai.google.dev
GROQ_API_KEY=your_groq_api_key              # Get from: https://console.groq.com

# LangSmith (Optional - for LLM observability)
LANGSMITH_API_KEY=your_langsmith_key        # Get from: https://smith.langchain.com
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=hvac-monitor

# Sensor Mode
SENSOR_MODE=realtime                         # Options: 'csv' or 'realtime'
```

### Sensor Modes

- **CSV Mode:** Replays historical sensor data from `assets/hvac_sensor_data.csv`
- **Real-Time Mode:** Generates live sensor data with dynamic anomaly injection

Switch modes at runtime:
```bash
# Via API
curl -X POST http://localhost:3000/api/sensor/mode \
  -H "Content-Type: application/json" \
  -d '{"mode":"realtime"}'
```

---

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts with AI explanations |
| GET | `/api/alerts/stats` | System-wide statistics |
| GET | `/api/alerts/detection-methods` | Detection method details |

### Sensor Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sensor/mode` | Get current sensor mode |
| POST | `/api/sensor/mode` | Switch sensor mode |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

---

## 🧪 Testing

### Backend

```bash
cd server
npm test          # Run unit tests
npm run lint      # Lint code
```

### Manual Testing

1. **Test API Endpoints**
   ```bash
   curl http://localhost:3000/api/alerts
   curl http://localhost:3000/api/sensor/mode
   ```

2. **Test Real-Time Mode**
   - Switch to real-time mode
   - Wait 2-5 minutes
   - Observe anomaly injection in server logs
   - Check mobile app for new alerts

3. **Test AI Explanations**
   - Open any alert detail screen
   - Verify AI-generated explanation appears
   - Check server logs for Groq fallback messages

---

## 📈 Performance

- **API Response Time:** 200-900ms (with AI explanations)
- **With Caching:** 5-50ms
- **Anomaly Detection:** 10-30ms per system
- **Real-Time Updates:** Every 60 seconds (mobile app)

**Optimization Highlights:**
- 142x performance improvement (37s → 0.26s average)
- Intelligent caching (5-minute TTL)
- Parallel AI processing
- Efficient sensor data generation

---

## 🤖 AI Design Decisions

### Why Deterministic Anomaly Detection?

Anomaly detection uses pure statistical methods (no ML models) because:
- **Reliability:** Deterministic behavior, no training required
- **Explainability:** Clear thresholds and rules
- **Performance:** Sub-30ms detection time
- **Maintenance:** No model retraining or drift management

### Why AI Only for Explanations?

AI (Gemini/Groq) is used exclusively for generating human-readable explanations because:
- **Separation of Concerns:** Detection logic remains deterministic
- **Graceful Degradation:** Rule-based fallback if AI fails
- **Cost Efficiency:** Only call AI for medium/high-risk alerts (risk ≥ 40)
- **Quality:** AI excels at natural language generation

### 3-Tier Fallback Strategy

1. **Gemini 2.0 Flash Lite** (primary) - Fast, high-quality
2. **Groq Llama 3.1 8B** (fallback) - Free, unlimited, fast
3. **Rule-Based** (last resort) - Risk-score based templates

This ensures users always get explanations, even during API outages.

See [docs/ai-design-decisions.md](docs/ai-design-decisions.md) for detailed rationale.

---

## 📁 Project Structure

```
hvac-monitor/
├── app/                          # Expo Router navigation
│   ├── (tabs)/                   # Tab-based navigation
│   └── _layout.tsx              # Root layout
├── src/                          # React Native source
│   ├── features/
│   │   └── alerts/
│   │       ├── screens/          # Dashboard, Detail screens
│   │       ├── services/         # API client
│   │       ├── types.ts          # TypeScript types
│   │       └── components/       # Reusable components
│   ├── shared/
│   │   ├── components/           # Shared UI components
│   │   └── utils/                # Utilities, dummy data
│   └── navigation/               # Navigation config
├── server/                       # Node.js backend
│   ├── services/
│   │   ├── sensorDataSource.js   # Sensor abstraction layer
│   │   ├── csvReplayService.js   # CSV data replay
│   │   ├── realtimeSensorService.js  # Live simulation
│   │   ├── enhancedAnomalyDetectionService.js  # Detection engine
│   │   └── aiExplanationService.js  # AI integration
│   ├── routes/
│   │   └── enhancedAlertRoutes.js  # API endpoints
│   ├── utils/
│   │   ├── dataCleaningUtils.js  # Data preprocessing
│   │   └── hybridDetectionUtils.js  # Detection algorithms
│   └── index.js                  # Server entry point
├── assets/                       # Static assets
│   └── hvac_sensor_data.csv     # Historical sensor data
├── docs/                         # Documentation
│   ├── architecture.md
│   ├── ai-design-decisions.md
│   └── tradeoffs.md
├── app.json                      # Expo config
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🛠️ Technologies

**Frontend:**
- React Native 0.74+
- Expo SDK 55
- TypeScript
- Expo Router (navigation)

**Backend:**
- Node.js 18+
- Express
- Google Gemini API
- Groq API
- LangSmith (observability)

**Anomaly Detection:**
- Z-Score statistical analysis
- Rolling window calculations
- Time-series pattern detection
- Correlation analysis

---

## 🔐 Security

- API keys stored in `.env` (gitignored)
- No sensitive data in client code
- Server-side AI calls only
- Input validation on all endpoints

---

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [AI Design Decisions](docs/ai-design-decisions.md)
- [Engineering Tradeoffs](docs/tradeoffs.md)
- [Real-Time Sensor Implementation](docs/realtime-sensors.md)
- [System Status](docs/system-status.md)

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Kill existing processes
pkill node

# Check .env exists
ls server/.env

# Restart
cd server && npm start
```

### Mobile App Can't Connect

1. Ensure backend is running on port 3000
2. Check your network IP in QR code
3. Verify firewall allows connections
4. Try web version: press `w` in Expo CLI

### No Anomalies Showing

- **Real-time mode:** Wait 2-5 minutes for first injection
- **CSV mode:** Should show immediately
- Check server logs for "Anomaly injected" messages

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Google Gemini API for AI explanations
- Groq for fast, free LLM inference
- LangSmith for LLM observability
- Expo team for excellent React Native tooling

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for HVAC maintenance professionals**
