# 🏭 Sentra AI — Explainable Maintenance Intelligence

AI-powered industrial maintenance assistant built with React Native, hybrid anomaly detection, and Gemini + Groq explainability to reduce alert fatigue for HVAC technicians.

> Reducing alert fatigue through explainable AI-driven maintenance intelligence.

---

# 🎯 Overview

Sentra AI is an AI-first maintenance intelligence platform designed for industrial HVAC environments where technicians face constant noisy alerts, false positives, and hidden failures.

Traditional threshold-based systems overwhelm maintenance teams with unreliable notifications. Sentra AI addresses this by combining deterministic anomaly detection with AI-generated operational explanations that help technicians quickly understand:

* what is happening
* why it matters
* what action should be taken

The system is designed specifically for:

* fast decision-making
* low cognitive load
* real-world maintenance workflows

---

# 🚀 Key Features

* 📊 Hybrid anomaly detection engine
* 🤖 AI-powered explainability (Gemini + Groq fallback)
* 📱 Mobile-first React Native experience
* 🌊 Real-time sensor simulation + CSV replay support
* ⚡ Intelligent alert prioritization
* 🧠 Technician-focused operational recommendations
* 🔄 Multi-tier fallback architecture
* 🏭 Industrial AI workflow design

---

# 🧠 Problem Statement

Manufacturing facilities often suffer from severe alert fatigue:

* 90% of alerts become noise
* technicians stop trusting systems
* real failures get buried
* costly downtime occurs unexpectedly

Most monitoring systems focus on thresholds.

Sentra AI focuses on:

> operational understanding and actionable maintenance intelligence.

---

# 🏗️ System Architecture

```text
React Native App
       ↓
Node.js Backend API
       ↓
Hybrid Anomaly Detection Engine
       ↓
AI Explanation Layer
(Gemini + Groq + Rule-based fallback)
       ↓
CSV Replay / Real-Time Sensor Simulation
```

---

# 🔍 Core AI Architecture

## 1. Deterministic Anomaly Detection

The anomaly engine uses hybrid statistical techniques:

* Z-score analysis
* Rolling mean deviation
* Sudden spike detection
* Gradual drift tracking
* Multi-sensor correlation

This layer remains deterministic for:

* reliability
* explainability
* predictable behavior
* operational safety

---

## 2. AI Explanation Layer

LLMs are intentionally used only for:

* contextual explanations
* maintenance recommendations
* operational reasoning
* technician-friendly summaries

### AI Stack

* Gemini Flash (primary)
* Groq Llama fallback
* Rule-based fallback system

This architecture ensures:

* graceful degradation
* low latency
* resilient operation
* controlled AI usage

---

# 🌊 Sensor Data Modes

## CSV Replay Mode

Uses historical HVAC sensor data for replay and analysis.

## Real-Time Simulation Mode

Simulates live industrial sensor behavior with:

* evolving conditions
* dynamic anomalies
* fluctuating operational metrics

The simulation layer exists to demonstrate realistic operational workflows while keeping the architecture lightweight and demo-friendly.

---

# 📱 Mobile Experience

Sentra AI is designed for technicians working on the floor — not sitting at dashboards.

The interface prioritizes:

* rapid understanding
* clear alert hierarchy
* minimal interaction cost
* actionable information

Technicians can identify critical systems within seconds.

---

# 📊 Example Alert Output

## What's Wrong

Boiler system 3 is operating outside normal thermal and vibration patterns.

## Why This Matters

Continued abnormal operation could reduce efficiency and increase risk of downtime.

## Likely Cause

Possible compressor strain or airflow restriction affecting heat transfer performance.

## Recommended Action

Inspect compressor assembly and airflow pathways. Prioritize maintenance if vibration continues increasing.

---

# ⚡ Performance Highlights

* Sub-second API responses
* Intelligent explanation caching
* Selective LLM usage
* Low-risk alerts avoid unnecessary AI calls
* Efficient real-time simulation updates

---

# 🧠 AI Design Philosophy

Sentra AI intentionally avoids using AI for critical anomaly scoring logic.

Instead:

* deterministic systems handle detection
* AI enhances human understanding

This separation improves:

* reliability
* explainability
* maintainability
* operational trust

The project focuses heavily on:

> knowing when NOT to use AI.

---

# 📁 Project Structure

```text
sentra-ai/
├── app/                  # Expo Router
├── src/                  # React Native source
├── server/               # Backend services
├── docs/                 # Architecture + design docs
├── assets/               # Icons, splash, datasets
├── README.md
└── app.json
```

---

# 🛠️ Tech Stack

## Frontend

* React Native
* Expo
* TypeScript

## Backend

* Node.js
* Express

## AI

* Google Gemini API
* Groq API

## Detection

* Statistical anomaly detection
* Time-series analysis
* Correlation analysis

---

# 🚀 Quick Start

## 1. Install dependencies

```bash
npm install

cd server
npm install
```

---

## 2. Configure environment variables

Create:

```bash
server/.env
```

Add:

```env
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
```

---

## 3. Start backend

```bash
cd server
npm start
```

---

## 4. Start app

```bash
npx expo start
```

---

# 📚 Documentation

Additional documentation is available inside `/docs`:

* architecture.md
* ai-design-decisions.md
* dataflow.md
* project-highlights.md
* tradeoffs.md
* quickstart.md

---

# 🔧 Future Improvements

With more time, the system could be extended with:

* real IoT streaming infrastructure
* historical trend learning
* technician feedback loops
* predictive maintenance forecasting
* edge deployment support
* custom evaluation pipelines

---

# 🎥 Walkthrough

[Add video link here]

---

# 🧠 Final Thought

Sentra AI is not just an alert dashboard.

It is an explainable maintenance intelligence system designed to help humans make faster, better operational decisions under real industrial conditions.
