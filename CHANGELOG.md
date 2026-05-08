# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-05-08

### 🎉 Initial Production Release

First production-ready release of HVAC Monitor with complete AI-powered anomaly detection.

### ✨ Features

#### Anomaly Detection
- **5-Method Hybrid Detection System**
  - Z-Score analysis (25% weight)
  - Rolling mean deviation (20% weight)
  - Sudden spike detection (25% weight)
  - Gradual drift detection (15% weight)
  - Multi-sensor correlation (15% weight)
- **Unified Risk Score** (0-100) with severity levels
- **Real-time sensor simulation** with dynamic anomaly injection
- **CSV replay mode** for historical data analysis

#### AI Explanation Layer
- **3-Tier Fallback System**
  - Primary: Google Gemini 2.0 Flash Lite
  - Fallback: Groq Llama 3.1 8B (FREE, unlimited)
  - Last resort: Rule-based intelligent templates
- **Selective AI usage** (only for risk ≥ 40)
- **5-minute caching** for performance
- **LangSmith integration** for LLM observability

#### Mobile App (React Native)
- **Dashboard** with alert prioritization
- **Urgent/Critical badges** for quick scanning
- **Detail screens** with AI explanations
- **Auto-refresh** every 60 seconds
- **Cross-platform** (iOS/Android via Expo)

#### Backend API (Node.js/Express)
- **RESTful API** with JSON responses
- **Sensor mode switching** (CSV/real-time) at runtime
- **Health check** endpoint
- **Comprehensive logging** with emojis for debugging
- **CORS enabled** for mobile access

### 🏗️ Architecture

- **Layered design** with clear separation of concerns
- **Data source abstraction** (pluggable CSV/real-time)
- **Modular services** (detection, AI, data cleaning)
- **Stateless backend** (horizontally scalable)

### 📚 Documentation

- **README.md** - Comprehensive project overview
- **QUICKSTART.md** - 5-minute setup guide
- **CONTRIBUTING.md** - Contribution guidelines
- **LICENSE** - MIT License
- **docs/architecture.md** - System architecture
- **docs/ai-design-decisions.md** - AI rationale
- **docs/tradeoffs.md** - Engineering decisions
- **docs/realtime-sensors.md** - Sensor simulation details
- **docs/system-status.md** - Current system state
- **docs/QUICKSTART.md** - Quick start in docs folder

### 🔧 Configuration

- **Environment variables** via `.env` files
- **API keys** for Gemini, Groq, LangSmith
- **Sensor mode** configuration
- **.env.example** templates provided

### 🚀 Performance

- **Sub-second response times** (200-900ms with AI)
- **3-50ms cached responses**
- **10-30ms anomaly detection** per system
- **142x optimization** from initial implementation

### 🐛 Bug Fixes

- **Status bar overlap** fixed on Android (dark symbols, proper padding)
- **Smart sensor filtering** (remove zero values, prioritize critical)
- **PowerShell syntax** issues resolved
- **Mode switching** properly re-initializes data source

### 🧹 Code Quality

- **Removed dead code** (mockData.ts, explanationService.ts, geminiClient.ts)
- **Cleaned temporary files** (list-models.js, test artifacts)
- **Organized documentation** into docs/ folder
- **Enhanced .gitignore** for comprehensive coverage
- **TypeScript errors** resolved

### 🔐 Security

- **API keys in .env** (gitignored)
- **No secrets in client code**
- **Server-side AI calls only**
- **Input validation** on all endpoints

---

## [0.2.0] - Development Milestone: Real-Time Sensors

### Added
- Real-time sensor simulation service
- Dynamic anomaly injection (spike, drift, multi-sensor)
- System-specific HVAC baselines (5 types)
- Mode control API endpoints
- Probabilistic anomaly timing

---

## [0.1.0] - Development Milestone: AI Integration

### Added
- Gemini API integration for explanations
- Groq fallback system
- LangSmith observability
- Comprehensive LLM logging
- 3-tier fallback architecture

---

## Future Roadmap

### Planned Features

#### v1.1.0
- [ ] Push notifications for critical alerts
- [ ] Historical trend charts
- [ ] Alert acknowledgment system
- [ ] User preferences storage

#### v1.2.0
- [ ] Multi-facility support
- [ ] Role-based access control
- [ ] Alert assignment workflow
- [ ] Email notifications

#### v2.0.0
- [ ] Predictive maintenance (failure prediction)
- [ ] Integration with real IoT sensors
- [ ] Advanced analytics dashboard
- [ ] Automated maintenance scheduling

---

## Breaking Changes

### None Yet

This is the first release. Breaking changes will be documented in future releases.

---

## Migration Guides

### Upgrading from Development Versions

If you have been using development versions:

1. **Update .env files** - Check .env.example for new variables
2. **Run npm install** - Update dependencies
3. **Delete node_modules** - Fresh install recommended
4. **Check API endpoints** - /api/alerts now includes AI explanations
5. **Sensor mode** - Set SENSOR_MODE in .env (defaults to realtime)

---

## Contributors

Thank you to everyone who contributed to this release!

- Core Development Team
- AI Integration Team
- Documentation Team
- Testing & QA Team

Special thanks to:
- Google Gemini team for AI API
- Groq team for free LLM inference
- LangSmith team for observability tools
- Expo team for React Native tooling

---

**For detailed changes, see commit history on GitHub.**
