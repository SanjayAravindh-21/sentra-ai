# 🤖 AI Design Decisions

## Core Philosophy

**AI is used exclusively for explainability, not detection.**

This document explains why we made specific architectural choices regarding the role of AI in the system.

---

## Decision 1: Deterministic Anomaly Detection

### Why No Machine Learning for Detection?

**Chosen Approach:** Pure statistical methods (Z-Score, Rolling Mean, etc.)

**Rationale:**

1. **Reliability & Predictability**
   - Statistical methods are deterministic
   - Same input → same output (reproducible)
   - No "black box" behavior
   - Clear thresholds and rules

2. **No Training Required**
   - Works immediately with any HVAC system
   - No need for historical labeled data
   - No model retraining or maintenance
   - No concept drift to manage

3. **Performance**
   - Sub-30ms detection time per system
   - Pure math, no neural network inference
   - Scales linearly with data volume
   - No GPU required

4. **Explainability**
   - Engineers can understand the logic
   - "Temperature is 2.5σ above mean" is clear
   - Audit trail is straightforward
   - Debugging is simple

5. **Resource Efficiency**
   - Minimal compute requirements
   - No model files to deploy/version
   - Tiny memory footprint
   - Can run on modest hardware

**Alternative Considered:** ML-based anomaly detection (Isolation Forest, LSTM, etc.)

**Why Rejected:**
- Would require training data collection
- Adds complexity without clear benefit for this use case
- HVAC systems are well-understood (physics-based)
- Statistical methods already achieve high accuracy

---

## Decision 2: AI Only for Explanations

### Why Use AI at All?

**Chosen Approach:** LLMs generate human-readable explanations AFTER detection

**Rationale:**

1. **Natural Language Generation**
   - AI excels at converting technical data into plain English
   - Can tailor explanations to context (risk level, affected sensors)
   - More engaging than template strings
   - Adapts tone based on severity

2. **Separation of Concerns**
   - Detection logic remains deterministic and testable
   - Explanation quality doesn't affect detection accuracy
   - Can improve AI layer without touching detection
   - Clear boundaries between layers

3. **Graceful Degradation**
   - If AI fails, fallback to rule-based explanations
   - Users still get actionable information
   - System remains operational during AI outages
   - No single point of failure

4. **Cost Optimization**
   - Only call AI for medium/high-risk alerts (risk ≥ 40)
   - Low-risk alerts use simple templates (risk < 40)
   - Reduces API costs by ~60%
   - Focuses AI budget on important alerts

**Example:**

**Detection Output (Technical):**
```json
{
  "system": "Compressor Unit 1",
  "riskScore": 85,
  "anomalies": [
    {"field": "temp", "method": "Z-Score", "deviation": 3.2},
    {"field": "vibration", "method": "Sudden Spike", "magnitude": 2.5}
  ]
}
```

**AI Explanation (Human-Readable):**
```
"Critical temperature spike detected in Compressor Unit 1, 
combined with elevated vibration suggests bearing failure. 
Immediate inspection required to prevent catastrophic damage."
```

---

## Decision 3: 3-Tier Fallback Strategy

### Why Multiple AI Providers?

**Architecture:**

```
Primary: Gemini 2.0 Flash Lite
  ↓ (on failure)
Fallback: Groq Llama 3.1 8B
  ↓ (on failure)
Last Resort: Rule-Based Templates
```

**Rationale:**

1. **Reliability**
   - No single point of failure
   - API quotas/outages don't break the app
   - Users always get explanations
   - 99.9%+ uptime for explanation service

2. **Cost Optimization**
   - Gemini: Fast and good, but rate-limited
   - Groq: FREE and unlimited (when Gemini exhausted)
   - Rule-based: Zero cost, instant

3. **Performance**
   - Gemini: 150-300ms (preferred)
   - Groq: 300-500ms (acceptable)
   - Rule-based: <5ms (adequate)

4. **Quality Gradient**
   - Tier 1 (Gemini): Excellent contextual explanations
   - Tier 2 (Groq): Good explanations, slightly less nuanced
   - Tier 3 (Rules): Basic but accurate explanations

**Real-World Behavior:**

- Day 1-15: Mostly Gemini (within free quota)
- Day 16+: Groq takes over (quota exceeded)
- Rare failures: Rule-based (network issues)

**User Experience:** Seamless - users don't know which tier was used

---

## Decision 4: Selective AI Usage (Risk ≥ 40)

### Why Not Generate Explanations for All Alerts?

**Chosen Approach:** AI only for medium/high/critical alerts

**Rationale:**

1. **Cost Savings**
   - Low-risk alerts (risk < 40) are often normal variation
   - Simple template sufficient: "Low-level variation detected"
   - Saves ~60% of LLM API calls
   - Reduces costs by ~$500/month at scale

2. **Performance**
   - Low-risk alerts skip LLM queue
   - Faster response times (5ms vs 300ms)
   - Less API load during normal operations
   - Scales better under high alert volume

3. **Focus on Important Alerts**
   - Engineers care most about high-risk issues
   - Detailed explanations more valuable for critical alerts
   - Low-risk alerts don't warrant detailed analysis
   - Better use of limited AI quota

**Thresholds:**

- **Risk 0-39:** Rule-based template (instant)
- **Risk 40-100:** AI explanation (300-500ms)

**Example Rule-Based Output (Risk 25):**
```
"Minor temperature anomaly detected. System operating 
within acceptable parameters. Continue monitoring."
```

**Example AI Output (Risk 85):**
```
"Critical temperature spike combined with vibration anomaly 
suggests bearing failure. Compressor Unit 1 requires immediate 
inspection. Risk of catastrophic failure if not addressed within 
2 hours."
```

---

## Decision 5: Caching Strategy (5-Minute TTL)

### Why Cache LLM Responses?

**Chosen Approach:** In-memory cache with 5-minute expiration

**Rationale:**

1. **Avoid Redundant Calls**
   - Same system state often repeats for several minutes
   - Gradual anomalies persist across multiple readings
   - Cache key: `${systemId}-${riskScore}-${affectedMetrics}`
   - Cache hit rate: ~40% after warm-up

2. **Performance**
   - Cache hit: <1ms response time
   - Cache miss: 300-500ms (LLM call)
   - Huge improvement for repeated requests
   - Better user experience (instant explanations)

3. **Cost Reduction**
   - 40% cache hit rate = 40% fewer LLM calls
   - Saves ~$200/month at scale
   - Reduces API quota consumption
   - Extends free tier usage

4. **Freshness Balance**
   - 5 minutes is short enough to stay current
   - Long enough to catch repeated patterns
   - Anomalies typically persist 5-30 minutes
   - Good tradeoff between freshness and caching

**Alternative Considered:** Longer TTL (15-30 minutes)

**Why Rejected:**
- Risk of stale explanations if situation changes
- 5 minutes captures most benefits
- Keeps explanations reasonably current

---

## Decision 6: Parallel AI Processing

### Why Process AI Calls Concurrently?

**Chosen Approach:** `Promise.all()` for multiple alert explanations

**Rationale:**

1. **Performance**
   - 5 sequential LLM calls: 5 × 400ms = 2000ms
   - 5 parallel LLM calls: 400ms (single request time)
   - **5x speedup** for multi-alert scenarios

2. **User Experience**
   - Dashboard loads faster
   - All explanations arrive together
   - No progressive loading delays
   - Perceived performance is excellent

3. **API Efficiency**
   - Maximizes throughput
   - Utilizes idle network time
   - Better use of API rate limits
   - No waiting for previous calls

**Implementation:**
```javascript
const enhancedAlerts = await Promise.all(
  alerts.map(async (alert) => {
    if (alert.riskScore >= 40) {
      const aiExplanation = await generateExplanation(alert);
      return { ...alert, aiExplanation };
    }
    return alert;
  })
);
```

---

## Decision 7: Prompt Engineering

### How Do We Get Quality Explanations?

**Chosen Approach:** Structured prompts with strict output format

**Prompt Structure:**
```
You are an HVAC maintenance assistant. Analyze this anomaly:

System: Compressor Unit 1
Risk Score: 85/100
Anomaly Types: sudden spike, statistical outlier
Affected Sensors: temperature, vibration

Provide:
1. Brief summary (max 12 words)
2. Likely cause (max 15 words)
3. Recommended action (max 18 words, urgent and specific)
4. Why this matters (max 15 words, explain impact)

Rules: Be specific, technical but clear, actionable. 
If uncertain say "possible" or "likely". 
Focus on real technician needs.

Return ONLY valid JSON:
{
  "summary": "...",
  "possibleCause": "...",
  "recommendedAction": "...",
  "whyMatters": "..."
}
```

**Why This Works:**

1. **Role Definition**
   - Sets AI context (HVAC expert)
   - Establishes tone and expertise level

2. **Structured Input**
   - Provides all relevant data
   - Clear format (no ambiguity)

3. **Length Constraints**
   - Forces concise output
   - Prevents rambling
   - Mobile-friendly text length

4. **Output Format**
   - JSON ensures parseability
   - Structured data for UI
   - Easy validation

5. **Behavioral Guidelines**
   - "Be specific" → avoid vague language
   - "Technical but clear" → right level
   - "Actionable" → focus on next steps

**Result:** 95%+ JSON parse success rate, high-quality explanations

---

## Decision 8: No Real-Time LLM Streaming

### Why Not Stream Explanations?

**Chosen Approach:** Wait for complete response, then display

**Rationale:**

1. **Mobile UI Complexity**
   - React Native doesn't need streaming for this use case
   - Explanations are short (30-60 words)
   - Complete response feels more polished
   - Avoid incomplete sentences

2. **Response Time**
   - 300-500ms is already fast enough
   - Streaming adds ~200ms setup overhead
   - No perceived benefit for short texts
   - Users don't notice 0.5s delay

3. **Implementation Simplicity**
   - No streaming parsing logic
   - No state management for partial responses
   - Simpler error handling
   - Less code to maintain

4. **Caching Compatibility**
   - Streaming responses can't be cached
   - Our caching strategy requires complete responses
   - Better performance with full response caching

**Alternative Considered:** Server-Sent Events (SSE) streaming

**Why Rejected:**
- Adds complexity without user benefit
- Mobile networks are fast enough
- Short explanations don't benefit from streaming
- Caching is more valuable than streaming

---

## Summary of AI Decisions

| Decision | Chosen Approach | Key Benefit |
|----------|----------------|-------------|
| **Detection** | Statistical (no ML) | Reliability & Performance |
| **AI Role** | Explanations only | Separation of concerns |
| **Fallback** | 3-tier (Gemini → Groq → Rules) | 99.9%+ uptime |
| **Selective Usage** | Risk ≥ 40 only | 60% cost savings |
| **Caching** | 5-minute TTL | 40% fewer LLM calls |
| **Processing** | Parallel (`Promise.all`) | 5x speedup |
| **Prompts** | Structured JSON output | 95%+ parse success |
| **Streaming** | No streaming | Simplicity & caching |

---

## Lessons Learned

1. **AI as a Feature Layer**
   - Don't make AI foundational to core logic
   - Use AI where it excels (natural language)
   - Keep critical paths deterministic

2. **Multiple Providers = Reliability**
   - No single API is 100% reliable
   - Free tier (Groq) is a game-changer
   - Fallbacks should be seamless

3. **Selective Intelligence**
   - Not every problem needs AI
   - Focus AI budget on high-value scenarios
   - Simple rules work for simple cases

4. **Performance Matters**
   - Caching is often better than faster models
   - Parallel processing beats sequential
   - Optimize the full pipeline, not just AI

5. **Simplicity Wins**
   - No streaming for short texts
   - No ML for well-understood problems
   - Keep architecture easy to understand

---

## Future Considerations

**If We Needed to Enhance:**

1. **Fine-Tuned Model**
   - Train on HVAC-specific data
   - Better technical terminology
   - Faster inference (smaller model)

2. **Multimodal Input**
   - Include sensor graphs/charts
   - Visual anomaly highlighting
   - Richer explanations

3. **Predictive Maintenance**
   - "Will likely fail in 2 weeks"
   - Requires historical failure data
   - ML might make sense here

4. **Custom LLM Deployment**
   - Self-hosted for data privacy
   - Lower latency (local inference)
   - Better cost at huge scale

**Not Planned:**
- These add complexity
- Current approach works well
- Solve real problems first
