# ⚖️ Engineering Tradeoffs

This document explains key technical decisions and their tradeoffs.

---

## Tradeoff 1: No Database vs Database

### Decision: No Database (Stateless Design)

**Pros:**
- ✅ Simpler architecture and deployment
- ✅ Zero database maintenance/backups
- ✅ Faster development velocity
- ✅ No database costs
- ✅ Easier to understand codebase
- ✅ Stateless = horizontally scalable

**Cons:**
- ❌ No persistent alert history
- ❌ Can't query historical trends
- ❌ No user preferences storage
- ❌ Limited analytics capabilities

**Why Chosen:**
- For a demo/MVP, database adds complexity without clear benefit
- CSV provides sufficient historical data
- Real-time mode generates fresh data
- Can add database later if needed (architecture supports it)

**When to Reconsider:**
- Multi-user production deployment
- Need for historical trend analysis
- Compliance requirements (data retention)
- Advanced analytics features

---

## Tradeoff 2: Mobile-First vs Web-First

### Decision: React Native Mobile App

**Pros:**
- ✅ Native mobile experience (iOS + Android)
- ✅ Push notifications capability (future)
- ✅ Offline support potential
- ✅ Better for on-the-go technicians
- ✅ App store distribution

**Cons:**
- ❌ More complex deployment than web
- ❌ Platform-specific issues
- ❌ App store review process
- ❌ Harder to update (vs instant web deploys)

**Why Chosen:**
- HVAC technicians are mobile (in the field)
- Better UX for alert monitoring on-the-go
- React Native expertise on team
- Can add web version later (shared code)

**Mitigation:**
- Expo simplifies deployment
- Web version available for testing (npx expo start --web)
- Hot updates bypass app store (Expo EAS)

---

## Tradeoff 3: Real-Time Simulation vs Real Sensors

### Decision: Simulated Sensor Data

**Pros:**
- ✅ Works immediately (no hardware needed)
- ✅ Controllable anomaly injection (testing)
- ✅ Demo-friendly (engaging behavior)
- ✅ No sensor integration complexity
- ✅ Free to run

**Cons:**
- ❌ Not production-ready for real deployment
- ❌ Doesn't reflect actual sensor behavior
- ❌ No real equipment monitoring
- ❌ Requires replacement for production use

**Why Chosen:**
- This is a proof-of-concept/demo
- Real sensor integration is deployment-specific
- Architecture supports pluggable data sources
- Easy to swap later (same interface)

**Migration Path:**
```javascript
// Current: Simulated
const data = await realtimeSensorService.getSensorData();

// Future: Real sensors
const data = await iotSensorService.getSensorData();
// (Same interface, different implementation)
```

---

## Tradeoff 4: Statistical vs ML-Based Detection

### Decision: Pure Statistical Methods

**Pros:**
- ✅ Deterministic and predictable
- ✅ No training data required
- ✅ Fast (<30ms per system)
- ✅ Easy to debug and explain
- ✅ No model maintenance

**Cons:**
- ❌ May miss complex patterns
- ❌ Fixed thresholds (not adaptive)
- ❌ Doesn't learn from feedback
- ❌ Less "intelligent" than ML

**Why Chosen:**
- HVAC systems are physics-based (well-understood)
- Statistical methods achieve good accuracy
- Simpler architecture
- No ML expertise required for maintenance
- Performance is excellent

**When ML Makes Sense:**
- Large historical dataset available
- Complex failure modes to learn
- Adaptive threshold requirements
- Predictive maintenance (failure prediction)

---

## Tradeoff 5: Monolith vs Microservices

### Decision: Monolithic Backend

**Pros:**
- ✅ Simple deployment (single process)
- ✅ Easy development (no service orchestration)
- ✅ Fast inter-service communication (in-process)
- ✅ Simpler debugging
- ✅ Lower infrastructure costs

**Cons:**
- ❌ Can't scale services independently
- ❌ Single deployment unit
- ❌ Potential resource contention
- ❌ Harder to use different tech stacks

**Why Chosen:**
- Current scale doesn't warrant microservices
- Premature optimization avoided
- Can refactor later if needed
- Keep It Simple, Stupid (KISS)

**When to Split:**
- One service becomes bottleneck
- Different scaling needs (e.g., AI service scales differently)
- Team organization changes (separate teams per service)
- Clear bounded contexts emerge

---

## Tradeoff 6: REST vs GraphQL

### Decision: REST API

**Pros:**
- ✅ Simple and well-understood
- ✅ No learning curve for team
- ✅ HTTP caching works naturally
- ✅ Smaller API surface
- ✅ Easy to test with curl

**Cons:**
- ❌ Over-fetching (get more data than needed)
- ❌ Multiple requests for related data
- ❌ Less flexible querying
- ❌ Version management required

**Why Chosen:**
- API is simple (few endpoints)
- Client needs match API responses well
- Team familiar with REST
- Caching benefits (5-min alert cache)

**GraphQL Not Needed:**
- No complex relationship queries
- No need for client-specific data shaping
- Fixed dashboard requirements
- Simple data model

---

## Tradeoff 7: TypeScript vs JavaScript

### Decision: TypeScript for Frontend, JavaScript for Backend

**Frontend (TypeScript):**

**Pros:**
- ✅ Type safety for React components
- ✅ Better IDE support
- ✅ Catch errors at compile time
- ✅ Self-documenting interfaces

**Backend (JavaScript):**

**Pros:**
- ✅ Faster development (no compilation)
- ✅ Simpler Node.js setup
- ✅ JSDoc provides some typing
- ✅ Less tooling complexity

**Why This Split:**
- Frontend benefits more from types (UI complexity)
- Backend is simpler (fewer moving parts)
- Can add TypeScript to backend later if needed

---

## Tradeoff 8: In-Memory Caching vs Redis

### Decision: In-Memory Caching (No Redis)

**Pros:**
- ✅ Zero external dependencies
- ✅ Instant cache access (<1ms)
- ✅ Simple implementation (Map object)
- ✅ No network latency
- ✅ No additional infra costs

**Cons:**
- ❌ Cache lost on server restart
- ❌ Not shared across instances
- ❌ Memory usage (limited by process)
- ❌ No persistence

**Why Chosen:**
- Single server deployment
- 5-minute TTL = acceptable to lose cache
- Warm-up time is minimal
- Keeps architecture simple

**When Redis Makes Sense:**
- Multiple backend instances (load balanced)
- Longer cache TTL required
- Shared state across servers
- Need cache persistence

---

## Tradeoff 9: Expo vs React Native CLI

### Decision: Expo

**Pros:**
- ✅ Faster development setup
- ✅ Hot updates (bypass app stores)
- ✅ Excellent dev experience
- ✅ EAS Build (cloud build service)
- ✅ Rich ecosystem (navigation, etc.)

**Cons:**
- ❌ Larger app bundle size
- ❌ Limited native module access
- ❌ Expo SDK version lock-in
- ❌ Some custom native code unsupported

**Why Chosen:**
- Speed of development prioritized
- Native module limitations not hit yet
- Excellent for MVP/demo
- Can eject if needed (future)

**Mitigation:**
- Expo SDK 55 supports most use cases
- Can use Expo modules for custom native code
- Ejection path available if constraints hit

---

## Tradeoff 10: Free LLM APIs vs Self-Hosted

### Decision: Cloud LLM APIs (Gemini, Groq)

**Pros:**
- ✅ Zero infrastructure to manage
- ✅ Always latest models
- ✅ Scales automatically
- ✅ Groq is completely free
- ✅ Fast inference (optimized hardware)

**Cons:**
- ❌ API rate limits
- ❌ Dependent on external services
- ❌ Data sent to third parties
- ❌ Potential costs at scale

**Why Chosen:**
- Free tier sufficient for demo
- Groq fallback eliminates quota concerns
- Self-hosting adds significant complexity
- Data is not sensitive (synthetic sensors)

**When Self-Hosting Makes Sense:**
- Data privacy requirements (real customer data)
- Very high volume (cost optimization)
- Custom model needs
- Network latency critical

---

## Tradeoff 11: Logging vs APM Tools

### Decision: Console Logging (No APM)

**Pros:**
- ✅ Zero cost
- ✅ Simple implementation
- ✅ Works everywhere (local, cloud)
- ✅ No vendor lock-in
- ✅ Easy debugging

**Cons:**
- ❌ No dashboards/visualization
- ❌ No alerting
- ❌ Hard to query/analyze
- ❌ Lost after log rotation

**Why Chosen:**
- Sufficient for development/demo
- Can add APM later (New Relic, DataDog)
- LangSmith covers LLM observability
- Keeps costs at zero

**When to Add APM:**
- Production deployment
- SLA requirements
- Need historical analysis
- Multiple team members

---

## Summary Table

| Decision | Chosen | Tradeoff | When to Reconsider |
|----------|--------|----------|-------------------|
| **Persistence** | No DB | Simplicity vs History | Multi-user production |
| **Platform** | Mobile-first | Native UX vs Deployment | Web-heavy use case |
| **Data Source** | Simulated | Demo-friendly vs Real | Actual deployment |
| **Detection** | Statistical | Speed vs Adaptiveness | Complex patterns |
| **Architecture** | Monolith | Simplicity vs Scalability | >100k users |
| **API** | REST | Simple vs Flexible | Complex queries |
| **Types** | TS Frontend only | Safety vs Speed | Backend complexity grows |
| **Cache** | In-memory | Simple vs Shared | Multi-instance deploy |
| **Framework** | Expo | Dev Speed vs Control | Native module needs |
| **LLM** | Cloud APIs | Easy vs Privacy | Sensitive data |
| **Logging** | Console | Cost vs Features | Production SLA |

---

## Overall Philosophy

1. **Start Simple**
   - Avoid premature optimization
   - Add complexity only when needed
   - Keep architecture clean

2. **Optimize for Development Speed**
   - Faster iteration = faster learning
   - Simple = easier to change
   - Don't over-engineer

3. **Leave Doors Open**
   - Abstraction layers allow swapping (sensor sources, cache, etc.)
   - Modular design supports refactoring
   - Migration paths exist for all decisions

4. **Prioritize User Value**
   - Ship working features fast
   - Perfect is enemy of good
   - Users don't care about tech stack

5. **Cost-Conscious**
   - Free tier choices where possible
   - Scale costs with value
   - Avoid expensive infra for MVP

---

## Key Takeaway

**These tradeoffs were right for this project at this time.**

As requirements evolve, revisit decisions. The architecture supports
evolution without rewrites.
