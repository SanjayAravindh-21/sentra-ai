# 🏗️ Architecture Overview

## System Design Philosophy

The HVAC Monitor follows a **layered architecture** with clear separation of concerns:

```
Presentation Layer (React Native)
        ↓
API Layer (REST/HTTP)
        ↓
Business Logic Layer (Node.js)
   ↓           ↓
Data Layer   AI Layer
```

---

## Layer Responsibilities

### 1. Presentation Layer

**Technology:** React Native + Expo
**Location:** `src/`, `app/`

**Responsibilities:**
- Display alert dashboard
- Show detailed alert information
- Handle user interactions
- Auto-refresh data (60s intervals)

**Key Components:**
- `DashboardScreen.tsx` - Main alert list with prioritization
- `AlertDetailScreen.tsx` - Detailed alert view with AI explanations
- `AlertCard.tsx` - Reusable alert card component

**Design Decisions:**
- ✅ Zero business logic in UI
- ✅ API service abstraction (`apiService.ts`)
- ✅ TypeScript for type safety
- ✅ Functional components with hooks

---

### 2. API Layer

**Technology:** Express.js REST API
**Location:** `server/routes/`

**Endpoints:**
- `GET /api/alerts` - Fetch all alerts with AI explanations
- `GET /api/alerts/stats` - System statistics
- `GET /api/sensor/mode` - Get/set sensor mode

**Design Decisions:**
- ✅ RESTful design
- ✅ JSON responses
- ✅ Error handling middleware
- ✅ Request logging

---

### 3. Business Logic Layer

**Location:** `server/services/`

#### 3.1 Sensor Data Source (`sensorDataSource.js`)

**Purpose:** Abstraction layer for data sources

**Modes:**
- **CSV Replay:** Read static data from file
- **Real-Time:** Generate live sensor data

**Benefits:**
- Pluggable data sources
- Easy testing (CSV mode)
- Engaging demos (real-time mode)

#### 3.2 Anomaly Detection Engine

**Files:**
- `enhancedAnomalyDetectionService.js` - Main orchestrator
- `hybridDetectionUtils.js` - Detection algorithms
- `dataCleaningUtils.js` - Data preprocessing

**Detection Methods:**

1. **Z-Score Analysis**
   - Statistical outlier detection
   - Threshold: 2.5 standard deviations
   - Weight: 25%

2. **Rolling Mean Deviation**
   - Recent average comparison
   - Window: 10 readings
   - Threshold: 15% deviation
   - Weight: 20%

3. **Sudden Spike Detection**
   - Abrupt value changes
   - Threshold: 2x change ratio
   - Weight: 25%

4. **Gradual Drift Detection**
   - Trending changes over time
   - Window: 20 readings
   - Threshold: 5% slope
   - Weight: 15%

5. **Multi-Sensor Correlation**
   - Multiple sensors anomalous simultaneously
   - Threshold: 2+ sensors
   - Weight: 15%

**Risk Score Calculation:**
```javascript
riskScore = Σ(method_severity × method_weight) / Σ(weights)
```

**Severity Mapping:**
- CRITICAL: 75-100 (immediate action)
- HIGH: 50-74 (action within 24h)
- MEDIUM: 25-49 (monitor closely)
- LOW: 0-24 (normal variation)

#### 3.3 AI Explanation Layer (`aiExplanationService.js`)

**3-Tier Fallback Strategy:**

```
┌─────────────────────────────────────────┐
│ 1. Gemini 2.0 Flash Lite (Primary)      │
│    • Fast (150-300ms)                   │
│    • High quality                       │
│    • Rate limited                       │
└──────────┬──────────────────────────────┘
           │ On failure (quota/timeout)
┌──────────▼──────────────────────────────┐
│ 2. Groq Llama 3.1 8B (Fallback)         │
│    • Fast (300-500ms)                   │
│    • FREE & unlimited                   │
│    • Good quality                       │
└──────────┬──────────────────────────────┘
           │ On failure (rare)
┌──────────▼──────────────────────────────┐
│ 3. Rule-Based (Last Resort)             │
│    • Instant (<5ms)                     │
│    • Risk-based templates               │
│    • Always available                   │
└─────────────────────────────────────────┘
```

**Optimization:**
- **Caching:** 5-minute TTL to avoid redundant LLM calls
- **Selective Usage:** Only for risk ≥ 40 (medium/high alerts)
- **Parallel Processing:** Multiple AI calls concurrently
- **Timeout:** 5-second limit per LLM call

---

## Data Flow

### Alert Generation Flow

```
1. Sensor Data Source
   ├─ CSV: Read from file
   └─ Real-Time: Generate live data
          ↓
2. Data Cleaning
   ├─ Handle missing values
   ├─ Validate sensor ranges
   └─ Fill gaps
          ↓
3. Group by System
   └─ Organize readings by HVAC unit
          ↓
4. Anomaly Detection (per system)
   ├─ Run 5 detection methods
   ├─ Collect anomalies
   └─ Calculate risk score
          ↓
5. AI Explanation (if risk ≥ 40)
   ├─ Try Gemini
   ├─ Fallback to Groq
   └─ Use rule-based if needed
          ↓
6. Response Formation
   ├─ Sort by risk score
   ├─ Add metadata
   └─ Return JSON
```

---

## Real-Time Sensor Simulation

**File:** `server/services/realtimeSensorService.js`

**Architecture:**

```
┌─────────────────────────────────────────────┐
│ RealtimeSensorService (Singleton)           │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ System State (per HVAC unit)         │   │
│ │ • 100-reading history buffer         │   │
│ │ • Anomaly injection state            │   │
│ │ • System-specific baselines          │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Generation Logic                     │   │
│ │ • Normal readings (±10-15% noise)    │   │
│ │ • Anomaly injection (probabilistic)  │   │
│ │ • Natural evolution                  │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Anomaly Injection:**

- **Timing:** Every 2-5 minutes (probabilistic)
- **Types:**
  - Sudden spike: 2-3x normal value, instant
  - Gradual drift: 15-40% deviation over 25 readings
  - Multi-sensor: 2-3 sensors affected simultaneously

**Benefits:**
- Engaging demos (data evolves live)
- Testing anomaly detection
- No external dependencies

---

## Technology Choices

### Frontend

**React Native + Expo:**
- ✅ Cross-platform (iOS/Android)
- ✅ Hot reload for fast development
- ✅ Rich ecosystem
- ✅ Easy deployment (Expo Go)

**TypeScript:**
- ✅ Type safety
- ✅ Better IDE support
- ✅ Catch errors at compile time

### Backend

**Node.js + Express:**
- ✅ JavaScript everywhere
- ✅ Fast development
- ✅ Excellent package ecosystem
- ✅ Good performance for I/O-bound tasks

**No Database:**
- ✅ Stateless design
- ✅ Simpler deployment
- ✅ CSV provides historical data
- ✅ Real-time mode generates data

---

## Scalability Considerations

### Current Design (Single Server)

**Capacity:**
- 100+ concurrent users
- 1000+ alerts/minute
- Sub-second response times

**Bottlenecks:**
- LLM API rate limits (handled by fallback)
- Single-threaded Node.js (acceptable for I/O)

### Future Scaling Options

**If Needed:**
1. **Horizontal Scaling:**
   - Load balancer + multiple backend instances
   - Stateless design makes this trivial

2. **Database Layer:**
   - PostgreSQL for historical alerts
   - Redis for caching
   - Time-series DB for sensor data

3. **Message Queue:**
   - Async LLM processing
   - Webhook notifications

4. **Microservices:**
   - Separate anomaly detection service
   - Dedicated AI explanation service

**Not Currently Needed:**
- System performs well for target use case
- Premature optimization avoided
- Can scale when actual need arises

---

## Security Architecture

### API Security

- ✅ CORS configured for mobile app
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak internals

### Secrets Management

- ✅ All API keys in `.env` (gitignored)
- ✅ No secrets in client code
- ✅ Server-side AI calls only

### Data Security

- ✅ No PII collection
- ✅ Sensor data is synthetic
- ✅ No authentication required (demo app)

**Production Additions Needed:**
- OAuth 2.0 authentication
- Role-based access control
- HTTPS only
- Rate limiting
- API key rotation

---

## Monitoring & Observability

**Current Implementation:**

1. **Server Logs:**
   - Structured logging with emojis
   - Request/response timing
   - LLM call tracking
   - Anomaly injection events

2. **LangSmith Integration:**
   - LLM call tracing
   - Performance metrics
   - Error tracking
   - Input/output logging

3. **Client-Side:**
   - Console logs (development)
   - Error boundaries (React)

**Production Additions:**
- Application Performance Monitoring (APM)
- Centralized logging (e.g., ELK stack)
- Health check endpoints
- Metrics dashboard

---

## Testing Strategy

### Unit Tests
- Anomaly detection algorithms
- Data cleaning utilities
- API service functions

### Integration Tests
- API endpoint responses
- Database interactions (if added)
- LLM fallback logic

### Manual Testing
- Mobile app UI/UX
- Real-time mode functionality
- Mode switching
- Error scenarios

---

## Deployment Architecture

**Development:**
```
Developer Machine
├─ Backend: localhost:3000
└─ Frontend: Expo Dev Server (localhost:8081)
     └─ Mobile: Expo Go app
```

**Production (Recommended):**
```
Cloud Provider (AWS/GCP/Azure)
├─ Backend: App Service/EC2/Compute Engine
│  ├─ PM2 for process management
│  ├─ NGINX reverse proxy
│  └─ Environment variables from secret manager
└─ Frontend: Expo EAS Build
   ├─ iOS: App Store
   └─ Android: Google Play Store
```

---

## Summary

**Architecture Strengths:**
- ✅ Clear separation of concerns
- ✅ Modular and testable
- ✅ Easy to understand and maintain
- ✅ Graceful degradation (AI fallbacks)
- ✅ Flexible data sources (CSV/real-time)

**Design Principles:**
- Keep it simple
- Optimize for developer experience
- Fail gracefully
- Log comprehensively
- Avoid premature optimization
