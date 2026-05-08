# 🚀 Quick Start Guide

Get the HVAC Monitor running in under 5 minutes.

---

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Expo Go app on your mobile device (iOS/Android)
- ✅ API keys ready (see below)

---

## Step 1: Get API Keys (2 minutes)

### Gemini API Key (Primary AI)

1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key

### Groq API Key (FREE Fallback)

1. Go to https://console.groq.com/keys
2. Sign up (free, no credit card)
3. Create new API key
4. Copy your API key

### LangSmith (Optional - for LLM tracking)

1. Go to https://smith.langchain.com/settings
2. Sign up (free tier available)
3. Create API key
4. Copy your API key

---

## Step 2: Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/hvac-monitor.git
cd hvac-monitor

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Step 3: Configure Backend (1 minute)

```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env with your API keys
# (Use notepad, VS Code, or any text editor)
```

**Minimum required in `server/.env`:**
```env
GEMINI_API_KEY=your_actual_gemini_key_here
GROQ_API_KEY=your_actual_groq_key_here
SENSOR_MODE=realtime
```

---

## Step 4: Start Backend (30 seconds)

```bash
cd server
npm start
```

You should see:
```
Server running on http://localhost:3000
=== ENHANCED HYBRID DETECTION API ===
Detection Methods: Z-Score, Rolling Mean, Spike, Drift, Correlation
```

**Keep this terminal open!**

---

## Step 5: Start Mobile App (30 seconds)

Open a **new terminal** in the project root:

```bash
npx expo start
```

You should see:
```
Expo DevTools running at http://localhost:19002
› QR code displayed below
```

---

## Step 6: Run on Your Phone (30 seconds)

### iOS:
1. Open Camera app
2. Point at QR code
3. Tap notification to open in Expo Go

### Android:
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Point at QR code

**First load may take 30-60 seconds - be patient!**

---

## ✅ Success!

You should now see:

- **Dashboard screen** with HVAC system alerts
- **Urgent/Critical badges** in top-right
- **Risk scores** and severity badges
- **Auto-refresh** every 60 seconds

**Tap any alert** to see detailed AI explanation.

---

## 🧪 Test Real-Time Mode

Real-time mode generates live sensor data with dynamic anomaly injection.

**What to expect:**

- First 1-2 minutes: Mostly normal readings (low risk)
- After 2-5 minutes: First anomaly injection
  - Watch server logs for: `⚠️ [REALTIME] Anomaly injected`
- After 5-10 minutes: Multiple systems may show anomalies
- Risk scores evolve: 0 → 70 → 85 → 100 (as anomalies progress)

**Server logs show:**
```
🔄 [REALTIME] Update 10: Generated 250 readings...
⚠️ [REALTIME] Anomaly injected in HVAC_4: gradual_drift (temperature)
🔄 [SENSOR] Switched to realtime mode
```

---

## 🐛 Troubleshooting

### "Can't connect to backend"

**Problem:** Mobile app shows network error

**Fix:**
```bash
# 1. Check backend is running (Step 4)
# 2. Check firewall allows connections
# 3. Verify you're on same WiFi network
# 4. Try web version: press 'w' in Expo CLI
```

### "No anomalies showing"

**Problem:** All alerts show low risk scores

**Fix:**
- **Real-time mode:** Wait 2-5 minutes for first injection
- **CSV mode:** Change `SENSOR_MODE=csv` in server/.env and restart

### "Gemini quota exceeded"

**Problem:** Server logs show 429 errors

**Fix:**
- This is normal! Groq fallback activates automatically
- Check logs for: `🔄 [LLM] Groq fallback for...`
- Explanations still work via Groq (free, unlimited)

### "Expo QR code not working"

**Problem:** Can't scan QR or connection fails

**Fix:**
```bash
# Try web version first
npx expo start --web

# Or try tunnel mode (slower but works across networks)
npx expo start --tunnel
```

---

## 🎯 Next Steps

**Explore Features:**
- Switch sensor modes (see [Architecture](architecture.md))
- View AI explanations (tap any medium/high-risk alert)
- Monitor server logs (watch LLM fallback in action)
- Check LangSmith dashboard (if configured)

**Read Documentation:**
- [Architecture Overview](architecture.md)
- [AI Design Decisions](ai-design-decisions.md)
- [Engineering Tradeoffs](tradeoffs.md)
- [Real-Time Sensor Implementation](realtime-sensors.md)

**Build for Production:**
- See main [README.md](../README.md) for deployment guides
- Configure production environment variables
- Set up proper HTTPS endpoints
- Add authentication if needed

---

## 💡 Tips

1. **Keep backend logs visible** - they show when anomalies inject
2. **Real-time mode is probabilistic** - each 60s update has ~10% anomaly chance
3. **AI explanations only for risk ≥ 40** - saves API costs
4. **Groq is completely free** - unlimited usage
5. **Web version works too** - press 'w' in Expo CLI

---

## 📚 API Testing

Test backend directly with curl:

```bash
# Get all alerts
curl http://localhost:3000/api/alerts

# Get stats
curl http://localhost:3000/api/alerts/stats

# Check sensor mode
curl http://localhost:3000/api/sensor/mode

# Switch to CSV mode
curl -X POST http://localhost:3000/api/sensor/mode \
  -H "Content-Type: application/json" \
  -d '{"mode":"csv"}'
```

---

**You're all set! 🎉**

For issues, check [README.md](../README.md) troubleshooting section or open a GitHub issue.
