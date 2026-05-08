# 🎬 Video Walkthrough Guide

A practical guide for recording a 2-3 minute technical walkthrough of the HVAC Monitor project.

**Goal:** Demonstrate engineering judgment, not sell a product.

---

## 📋 Pre-Recording Checklist

### Technical Setup

- [ ] Backend running (`cd server && npm start`)
- [ ] Real-time mode active (`SENSOR_MODE=realtime` in .env)
- [ ] Mobile app running with visible alerts
- [ ] Screen recording software ready (OBS, QuickTime, etc.)
- [ ] Close unnecessary browser tabs
- [ ] Hide desktop clutter
- [ ] Disable notifications (Slack, email, etc.)
- [ ] Charge device to 80%+

### Content Prep

- [ ] Wait 3-5 minutes after backend starts (let anomalies inject)
- [ ] Have 3-4 alerts showing with different severities
- [ ] One alert open in detail view (for AI explanation demo)
- [ ] Server logs visible in terminal (optional but good)

---

## 🎯 Video Structure (2-3 minutes)

### Timing Breakdown

- **Opening:** 15-20 seconds
- **Problem Context:** 15-20 seconds
- **Architecture:** 30-40 seconds
- **Live Demo:** 45-60 seconds
- **Design Decisions:** 20-30 seconds
- **Closing:** 10-15 seconds

**Total:** 2:15-3:05

---

## 📹 Section-by-Section Guide

### 1. Opening (15-20 sec)

**Show:** Your face or project README on screen

**Say (structured points, not script):**
- Hi, I'm [name], showing an AI-powered HVAC maintenance assistant
- Built with React Native, Node.js, and a hybrid detection system
- Focuses on real-time anomaly detection with intelligent explanations

**Tone:** Casual, confident, brief

**Avoid:**
- ❌ "This revolutionary AI-powered solution..."
- ❌ Long intros about yourself
- ❌ Apologizing for anything

---

### 2. Problem Context (15-20 sec)

**Show:** Architecture diagram or problem statement doc

**Cover (pick 2-3 points):**
- HVAC systems generate constant sensor data (temp, pressure, vibration, etc.)
- Alert fatigue is real: too many false positives = ignored alerts
- Need: accurate detection + actionable explanations
- Challenge: balance automation with reliability

**Key Point:**
> "The hard part isn't detecting anomalies—it's explaining them in a way maintenance teams trust."

**Avoid:**
- ❌ Generic "businesses lose money" claims
- ❌ Made-up statistics
- ❌ Over-explaining HVAC basics

---

### 3. Architecture Overview (30-40 sec)

**Show:** Architecture diagram from docs/architecture.md

**Explain the layers (top to bottom):**

1. **Mobile App (React Native)**
   - Dashboard shows all systems
   - Auto-refreshes every 60 seconds
   - Detail view for each alert

2. **Detection Layer (Deterministic)**
   - 5 statistical methods: Z-Score, rolling mean, spike detection, drift, correlation
   - Each weighted differently
   - Produces unified risk score 0-100

3. **AI Explanation Layer (Gemini/Groq)**
   - Only for medium/high-risk alerts (≥40)
   - 3-tier fallback: Gemini → Groq → rule-based
   - Generates human-readable explanations

**Key Engineering Point:**
> "Detection is deterministic. AI is only for explainability. This separation keeps the system reliable while making outputs useful."

**Avoid:**
- ❌ Reading bullet points verbatim
- ❌ "As you can see here..." (just explain it)
- ❌ Apologizing for diagram quality

---

### 4. Live App Demo (45-60 sec)

**Show:** Mobile app or web version

**Flow:**

**A. Dashboard (15 sec)**
- Scroll through alert list
- Point out risk scores (color-coded)
- Highlight urgent/critical badges in top-right
- Note different HVAC systems (Compressor, Chiller, etc.)

**What to say:**
- "Each system has a risk score based on 5 detection methods"
- "Here's a critical alert at 85—likely needs immediate attention"
- "These low-risk ones at 15-20 are probably just normal fluctuations"

**B. Detail Screen (30 sec)**
- Tap one medium or high-risk alert
- Show affected metrics (which sensors are anomalous)
- Read AI explanation briefly

**What to say:**
- "This shows temperature and vibration both spiking"
- "The AI explanation suggests a bearing issue—specific and actionable"
- "Notice it says 'likely' not 'definitely'—acknowledges uncertainty"

**C. Optional: Show Another Alert (15 sec)**
- Tap different severity level
- Show how explanation changes based on context

**Avoid:**
- ❌ Clicking aimlessly
- ❌ "This is really cool" or "I love this feature"
- ❌ Explaining obvious UI elements (back button, etc.)

---

### 5. Design Decisions (20-30 sec)

**Show:** Code or architecture doc (optional)

**Explain 2-3 key decisions:**

**A. Why Deterministic Detection?**
- HVAC systems are physics-based—we understand the rules
- Statistical methods are fast (<30ms) and predictable
- No training data needed, no model drift
- Engineers can audit the logic

**B. Why Hybrid (Deterministic + LLM)?**
- LLMs are great at natural language, not reliable for detection
- Separation of concerns: detection stays deterministic
- AI adds context without introducing unpredictability
- Falls back gracefully if LLM fails

**C. Why 3-Tier Fallback?**
- Gemini quota is limited
- Groq is free and fast (fallback)
- Rule-based templates work even if both APIs fail
- Users always get an explanation

**Key Quote:**
> "I didn't use ML for detection because I didn't need to. The value is in the explanation layer."

**Avoid:**
- ❌ "I tried ML but it didn't work" (sounds like failure)
- ❌ Defensive tone
- ❌ Over-justifying choices

---

### 6. Tradeoffs (15-20 sec)

**Show:** Tradeoffs doc or keep app visible

**Pick 2 tradeoffs to mention:**

**Option 1:**
- "No database right now—stateless design for simplicity"
- "Would add Postgres for historical analysis in production"

**Option 2:**
- "Using simulated sensors, not real IoT"
- "Architecture supports swapping data sources—same interface"

**Option 3:**
- "Mobile-first, which adds deployment complexity vs web"
- "But technicians are mobile, so it fits the use case"

**Tone:** Matter-of-fact, not apologetic

**Avoid:**
- ❌ "I wish I had time to..." (sounds incomplete)
- ❌ Listing every tradeoff
- ❌ "This is just a demo" (downplaying your work)

---

### 7. Closing (10-15 sec)

**Show:** App or code

**Wrap up with:**
- "Code is on GitHub, fully documented"
- "Happy to discuss design decisions or architecture"
- Optional: mention one thing you'd add next (push notifications, predictive maintenance, etc.)

**Tone:** Confident, open to feedback

**Avoid:**
- ❌ "Thanks for watching!" (too casual for technical submission)
- ❌ "Let me know what you think" (sounds insecure)
- ❌ Trailing off

---

## 🎤 Recording Tips

### Pacing

- **Speak at 80% speed** (you'll sound thoughtful, not rushed)
- **Pause between sections** (1-2 seconds—helps with editing)
- **Breathe** (seriously, slow down)

### Voice

- **Vary intonation** (monotone is sleep-inducing)
- **Sound interested** (if you're bored, viewers will be)
- **Avoid filler words** (um, like, so, basically)
  - If you say one, pause and re-record the sentence

### Screen Actions

- **Move cursor intentionally** (don't wave it around)
- **Click/scroll smoothly** (not erratically)
- **Hold on key info for 2-3 seconds** (let viewers read)
- **Zoom in if showing code** (readability matters)

---

## 🎬 Recording Best Practices

### Before You Record

1. **Practice once** (don't over-rehearse—you'll sound robotic)
2. **Write bullet points** (not a script)
3. **Time yourself** (cut sections if over 3 minutes)

### During Recording

1. **Record in segments** (easier to re-do one section)
2. **Pause between sections** (makes editing easier)
3. **Leave 3 seconds of silence at start/end** (room to fade in/out)
4. **If you mess up, pause, then restart the sentence** (don't start over)

### After Recording

1. **Watch it once** (check for major issues)
2. **Edit out long pauses** (keep it tight)
3. **Add captions** (accessibility + clarity)
4. **Check audio levels** (not too quiet or too loud)

---

## 📱 Device/Simulator Recommendations

### Best Options

1. **Web version** (`npx expo start --web`)
   - Easiest to record
   - Fullscreen, no distractions
   - Screen recording software works perfectly

2. **iOS Simulator** (if on Mac)
   - Professional look
   - Easy screen recording (Cmd+R in simulator)
   - No status bar clutter

3. **Android Emulator**
   - Works well
   - Use Android Studio's built-in recording

4. **Physical Device** (least recommended for video)
   - Harder to record cleanly
   - Status bar shows real time/battery
   - Use screen mirroring software (Reflector, AirPlay)

### Setup

- **Landscape or Portrait?** Portrait (matches mobile app reality)
- **Zoom Level:** Readable text, not too zoomed in
- **Background:** Clean, minimal
- **Lighting:** Bright, even (if showing face)

---

## 🚫 Common Mistakes to Avoid

### Content Mistakes

- ❌ **Explaining obvious things** ("This is the dashboard...")
- ❌ **Apologizing** ("Sorry this isn't perfect...")
- ❌ **Over-selling** ("Amazing", "revolutionary", "game-changing")
- ❌ **Buzzword salad** ("Leveraging AI to synergize...")
- ❌ **Going over 3 minutes** (trim ruthlessly)

### Technical Mistakes

- ❌ **Recording with low battery** (looks unprofessional)
- ❌ **Visible notifications** (disable them)
- ❌ **Messy desktop** (hide it or use clean background)
- ❌ **Network errors** (test before recording)
- ❌ **Tiny text** (zoom in on code)

### Delivery Mistakes

- ❌ **Monotone voice** (vary pitch and energy)
- ❌ **Too fast** (slow down, breathe)
- ❌ **Reading from script** (use bullet points)
- ❌ **Uncertainty** ("I think", "maybe", "kind of")
- ❌ **Rambling** (say it, then move on)

---

## 📊 Recommended Screen Flow

**Order to show screens:**

1. **Opening:** Your face or README (5 sec)
2. **Architecture diagram** (30 sec)
3. **Mobile app - Dashboard** (15 sec)
4. **Mobile app - Detail screen #1** (20 sec)
5. **Mobile app - Detail screen #2** (15 sec, optional)
6. **Code or diagram** (20 sec, while discussing decisions)
7. **App or GitHub repo** (10 sec, closing)

**Total:** ~2:30 with buffer

---

## 🎯 Key Messages to Convey

By the end, viewers should understand:

1. ✅ **The problem:** Alert fatigue in HVAC maintenance
2. ✅ **The approach:** Hybrid detection (deterministic + AI explanations)
3. ✅ **The architecture:** Layered, separation of concerns
4. ✅ **The reasoning:** Why not ML for detection, why 3-tier fallback
5. ✅ **The tradeoffs:** Conscious decisions, not limitations
6. ✅ **The outcome:** Working system, thoughtful engineering

**They should think:**
> "This person understands when to use AI and when not to. They think about failure modes. I'd trust their engineering judgment."

---

## ✅ Pre-Flight Checklist

Right before you hit record:

- [ ] Close all unnecessary apps/windows
- [ ] Disable notifications (Do Not Disturb mode)
- [ ] Backend running with anomalies visible
- [ ] App showing 3-4 alerts
- [ ] Architecture diagram ready
- [ ] Cursor not visible (or move it off-screen)
- [ ] Audio input tested
- [ ] Quiet environment
- [ ] Water nearby (hydration matters)
- [ ] Bullet points ready (not script)
- [ ] Timer set (3-minute max reminder)

---

## 💡 Pro Tips

1. **Energy matters:** Sound interested (not hyped, just engaged)
2. **Silence is OK:** Pauses let points land
3. **Show, don't tell:** Let the app speak for itself
4. **Edit ruthlessly:** Cut anything that doesn't add value
5. **Get feedback:** Show draft to one person before submitting
6. **Don't over-polish:** Authentic > perfect

---

## 🎓 Example Phrasing

### Good Phrasing ✅

- "The detection layer uses five statistical methods..."
- "I chose deterministic detection because..."
- "Here's a critical alert—temperature and vibration both anomalous"
- "The AI explanation is specific: bearing failure, immediate inspection"
- "If Gemini hits quota, Groq takes over automatically"
- "This is a conscious tradeoff—simplicity now, database later"

### Bad Phrasing ❌

- "So, um, basically what I did was..."
- "This is kind of cool, I think..."
- "Sorry, this isn't perfect but..."
- "As you can see here, this is the dashboard..."
- "I would've added more features if I had time..."
- "Let me know what you think in the comments!"

---

## 🚀 Final Thoughts

**Remember:**
- You're demonstrating **engineering judgment**, not selling software
- Show **reasoning**, not just features
- Be **confident but honest** about tradeoffs
- **3 minutes max**—respect the viewer's time

**The goal is for reviewers to think:**
> "This person ships working software, thinks through edge cases, and makes pragmatic decisions. I'd work with them."

---

**You've got this. Now go record a great walkthrough! 🎬**
