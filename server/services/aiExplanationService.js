// Backend AI Service - Gemini API calls with LangSmith tracking
require('dotenv').config();
const fetch = require('node-fetch');

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ [CONFIG] GEMINI_API_KEY is not set in .env file!');
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const REQUEST_TIMEOUT = 5000; // 5 seconds timeout
const MAX_RETRIES = 0; // No retries - fail fast

if (GROQ_API_KEY) {
  console.log('✅ [CONFIG] Groq API fallback enabled');
}

// LangSmith configuration (optional)
let traceable;
if (process.env.LANGSMITH_API_KEY) {
  try {
    const { traceable: importedTraceable } = require('langsmith/traceable');
    traceable = importedTraceable;
    console.log('✅ [CONFIG] LangSmith tracking enabled');
  } catch (error) {
    console.warn('⚠️ [CONFIG] LangSmith package not installed. Run: npm install langsmith');
  }
}

// In-memory cache to reduce API calls
const explanationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(alert) {
  return `${alert.systemId}-${alert.riskScore}-${alert.affectedMetrics.join(',')}`;
}

async function callGemini(prompt) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Fail fast on quota errors - no retries
        if (response.status === 429) {
          console.error('❌ [LLM] Gemini API quota exceeded');
          throw new Error(`Gemini API quota exceeded - using fallback`);
        }
        console.error(`❌ [LLM] Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
        throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error('❌ [LLM] No text in Gemini response');
        throw new Error('No text in response');
      }
      return text.trim();

    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') throw new Error(`Timeout after ${REQUEST_TIMEOUT}ms`);
      // No retries - fail immediately
      throw error;
    }
  }
}

async function callGroq(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast, free Groq model
        messages: [
          {
            role: 'system',
            content: 'You are an HVAC maintenance assistant. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ [LLM] Groq API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      console.error('❌ [LLM] No text in Groq response');
      throw new Error('No text in Groq response');
    }
    return text.trim();

  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Groq timeout after ${REQUEST_TIMEOUT}ms`);
    throw error;
  }
}

function buildPrompt(alert) {
  const systemType = alert.systemName.toLowerCase();
  const anomalyTypes = [];
  if (alert.anomalyTypes.sudden_spike) anomalyTypes.push('sudden spike');
  if (alert.anomalyTypes.gradual_drift) anomalyTypes.push('gradual drift');
  if (alert.anomalyTypes.statistical_outlier) anomalyTypes.push('statistical outlier');
  if (alert.anomalyTypes.trend_deviation) anomalyTypes.push('trend deviation');
  if (alert.anomalyTypes.multi_sensor) anomalyTypes.push('multi-sensor correlation');

  return `You are an HVAC predictive maintenance assistant helping technicians diagnose equipment issues.

System: ${alert.systemName}
Risk Score: ${alert.riskScore}/100
Detected Patterns: ${anomalyTypes.join(', ')}
Affected Measurements: ${alert.affectedMetrics.join(', ')}

🎯 CRITICAL INSTRUCTION:
Prefer explaining likely HVAC system or equipment behavior rather than assuming sensor failure.

Only mention sensor faults, calibration issues, or thermocouple problems if the anomaly pattern strongly indicates impossible readings, stuck values, missing data, or obvious sensor malfunction.

Instead, focus on:
- Equipment condition (wear, strain, degradation)
- Operational issues (airflow restriction, thermal efficiency, mechanical stress)
- System behavior (performance drift, load changes, component interaction)
- Maintenance implications (preventive actions, inspection priorities)

Provide:
1. Brief summary describing EQUIPMENT/SYSTEM issue (max 12 words)
2. Likely EQUIPMENT-LEVEL cause (max 18 words)
3. Recommended MAINTENANCE action (max 20 words, specific and actionable)
4. Operational impact (max 18 words)

Rules: Be technician-focused, operational, actionable. Use "possible" or "likely" for uncertainty. Avoid robotic sensor-diagnostic language.

Return ONLY valid JSON:
{
  "summary": "equipment/system-focused description",
  "possibleCause": "equipment-level root cause",
  "recommendedAction": "specific maintenance action",
  "whyMatters": "operational/business impact"
}`;
}

function parseResponse(response, alert) {
  try {
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    if (parsed.summary && parsed.possibleCause && parsed.recommendedAction) {
      return {
        summary: parsed.summary,
        possibleCause: parsed.possibleCause,
        recommendedAction: parsed.recommendedAction,
        whyMatters: parsed.whyMatters || 'Could impact system reliability'
      };
    }
    throw new Error('Invalid structure');
  } catch (error) {
    console.error('Parse error:', error);
    return getFallbackExplanation(alert);
  }
}

function getFallbackExplanation(alert) {
  const riskScore = alert.riskScore || 0;
  const systemType = alert.systemName.toLowerCase();
  
  // Map affected metrics to equipment-level issues
  const hasTemp = alert.affectedMetrics.some(m => m === 'temp' || m === 'temperature');
  const hasPressure = alert.affectedMetrics.some(m => m === 'pressure');
  const hasVibration = alert.affectedMetrics.some(m => m === 'vibration');
  const hasAirflow = alert.affectedMetrics.some(m => m === 'airflow');
  const hasPower = alert.affectedMetrics.some(m => m === 'power');

  let summary, cause, action, whyMatters;
  
  if (riskScore >= 75) {
    // Critical: Equipment-level failure
    if (systemType.includes('compressor')) {
      summary = 'Compressor operating outside critical thresholds';
      cause = 'Likely mechanical stress, bearing wear, or refrigerant system issue';
      action = 'Immediate inspection required - assess shutdown risk and mechanical condition';
    } else if (systemType.includes('chiller')) {
      summary = 'Chiller system showing critical performance deviation';
      cause = 'Possible refrigerant leak, evaporator fouling, or compressor failure';
      action = 'Emergency assessment needed - check refrigerant levels and heat exchange surfaces';
    } else if (systemType.includes('boiler')) {
      summary = 'Boiler operating in critical abnormal state';
      cause = 'Possible combustion issue, heat exchanger fouling, or circulation problem';
      action = 'Immediate inspection - verify combustion efficiency and water circulation';
    } else {
      summary = 'Critical equipment performance deviation detected';
      cause = 'Likely component failure or severe operational degradation';
      action = 'Immediate inspection required - assess shutdown risk and component condition';
    }
    whyMatters = 'High risk of equipment failure and unplanned downtime';
  } else if (riskScore >= 50) {
    // High: Degrading equipment
    if (hasVibration && hasTemp) {
      summary = 'Elevated mechanical stress and thermal load detected';
      cause = 'Possible bearing wear, misalignment, or lubrication issue affecting heat dissipation';
      action = 'Schedule maintenance inspection within 24 hours - check bearings and alignment';
    } else if (hasPressure && hasAirflow) {
      summary = 'Airflow and pressure patterns indicate system restriction';
      cause = 'Likely filter blockage, duct obstruction, or damper malfunction';
      action = 'Inspect airflow pathways, replace filters, and check damper operation';
    } else if (hasTemp) {
      summary = 'Abnormal thermal operation detected';
      cause = 'Possible heat exchanger efficiency loss or thermal control degradation';
      action = 'Inspect heat transfer surfaces and verify control system calibration';
    } else {
      summary = 'Equipment operating outside normal performance range';
      cause = 'Possible component wear, efficiency loss, or operational stress';
      action = 'Schedule inspection within 24 hours to assess component condition';
    }
    whyMatters = 'Could escalate to failure if maintenance is deferred';
  } else if (riskScore >= 25) {
    // Medium: Early degradation
    summary = 'Minor equipment performance drift detected';
    cause = 'Possible early wear, loading changes, or gradual efficiency degradation';
    action = 'Monitor trend and schedule routine inspection if pattern persists';
    whyMatters = 'Early detection enables preventive maintenance planning';
  } else {
    summary = 'Equipment operating within normal variation';
    cause = 'Likely normal operational variation or load-related fluctuation';
    action = 'Continue routine monitoring - no immediate action required';
    whyMatters = 'System performance within acceptable operational parameters';
  }

  return { summary, possibleCause: cause, recommendedAction: action, whyMatters };
}

async function generateExplanationCore(alert) {
  const startTime = Date.now();
  console.log(`🤖 [LLM] Generating explanation for ${alert.systemName} (risk: ${alert.riskScore})`);
  
  // Only use AI for medium/high risk (>= 40)
  if (alert.riskScore < 40) {
    console.log(`📦 [LLM] Low risk (${alert.riskScore}) - using fallback for ${alert.systemName}`);
    return getFallbackExplanation(alert);
  }

  // Check cache
  const cacheKey = getCacheKey(alert);
  const cached = explanationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    const duration = Date.now() - startTime;
    console.log(`📦 [LLM] Cache hit for ${alert.systemName} (${duration}ms)`);
    return cached.explanation;
  }

  const prompt = buildPrompt(alert);
  
  // Try Gemini first
  try {
    console.log(`🌐 [LLM] Calling Gemini API for ${alert.systemName}...`);
    const response = await callGemini(prompt);
    const explanation = parseResponse(response, alert);

    // Cache result
    explanationCache.set(cacheKey, { explanation, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ [LLM] Gemini success for ${alert.systemName} in ${duration}ms: ${explanation.summary.substring(0, 50)}...`);

    return explanation;
  } catch (geminiError) {
    const geminiDuration = Date.now() - startTime;
    console.error(`❌ [LLM] Gemini failed for ${alert.systemName} after ${geminiDuration}ms: ${geminiError.message}`);
    
    // Try Groq as fallback if available
    if (GROQ_API_KEY) {
      try {
        console.log(`🔄 [LLM] Trying Groq fallback for ${alert.systemName}...`);
        const groqResponse = await callGroq(prompt);
        const explanation = parseResponse(groqResponse, alert);

        // Cache result
        explanationCache.set(cacheKey, { explanation, timestamp: Date.now() });
        
        const totalDuration = Date.now() - startTime;
        console.log(`✅ [LLM] Groq success for ${alert.systemName} in ${totalDuration}ms: ${explanation.summary.substring(0, 50)}...`);

        return explanation;
      } catch (groqError) {
        const totalDuration = Date.now() - startTime;
        console.error(`❌ [LLM] Groq also failed for ${alert.systemName} after ${totalDuration}ms: ${groqError.message}`);
      }
    }
    
    // Use rule-based fallback as last resort
    console.log(`⚠️ [LLM] Using rule-based fallback for ${alert.systemName}`);
    return getFallbackExplanation(alert);
  }
}

// Wrap with LangSmith traceable if available
const generateExplanation = traceable 
  ? traceable(generateExplanationCore, {
      name: 'hvac-ai-explanation',
      project: 'hvac-monitor',
      tags: ['gemini', 'anomaly-detection'],
      metadata: (alert) => ({
        systemName: alert.systemName,
        riskScore: alert.riskScore,
        affectedMetrics: alert.affectedMetrics.join(', '),
      })
    })
  : generateExplanationCore;

module.exports = { generateExplanation };
