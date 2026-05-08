# 🤝 Contributing to HVAC Monitor

Thank you for your interest in contributing! This guide will help you get started.

---

## 🎯 Ways to Contribute

- 🐛 **Report Bugs:** Open an issue with reproduction steps
- 💡 **Suggest Features:** Describe your idea in an issue
- 📖 **Improve Docs:** Fix typos, add examples, clarify explanations
- 🔧 **Fix Bugs:** Submit a pull request with a fix
- ✨ **Add Features:** Implement and submit new functionality

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/hvac-monitor.git
cd hvac-monitor
git remote add upstream https://github.com/ORIGINAL_OWNER/hvac-monitor.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming:**
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation
- `refactor/` for code improvements

### 3. Make Changes

- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused
- Test your changes thoroughly

### 4. Commit

```bash
git add .
git commit -m "feat: add real-time alert notifications"
# or
git commit -m "fix: resolve status bar overlap on Android"
```

**Commit message format:**
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` add/update tests
- `chore:` maintenance tasks

### 5. Push & PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

---

## 📝 Code Style Guidelines

### TypeScript (Frontend)

```typescript
// ✅ Good: Type everything
interface AlertProps {
  alert: Alert;
  onPress: () => void;
}

// ❌ Bad: Implicit any
function processAlert(alert) { ... }
```

### JavaScript (Backend)

```javascript
// ✅ Good: Clear function names, JSDoc comments
/**
 * Detects anomalies using Z-Score analysis
 * @param {number[]} data - Sensor readings
 * @param {number} threshold - Standard deviation threshold
 * @returns {boolean} True if anomaly detected
 */
function detectZScoreAnomaly(data, threshold) { ... }

// ❌ Bad: Unclear names, no docs
function detect(d, t) { ... }
```

### General Principles

- **DRY:** Don't Repeat Yourself
- **KISS:** Keep It Simple, Stupid
- **YAGNI:** You Aren't Gonna Need It
- **Separation of Concerns:** Each file has one responsibility

---

## 🧪 Testing

### Before Submitting

1. **Test locally:**
   ```bash
   # Start backend
   cd server && npm start
   
   # Start frontend
   npx expo start
   ```

2. **Test on device:** Verify changes work on actual mobile device

3. **Check for errors:**
   - Backend: Check server logs for errors
   - Frontend: Check Expo console for warnings

4. **Test edge cases:**
   - What if API fails?
   - What if data is missing?
   - What if user taps rapidly?

### Writing Tests (Future)

When adding tests, follow these patterns:

```javascript
// Backend test example
describe('Anomaly Detection', () => {
  it('should detect Z-Score outliers', () => {
    const data = [10, 10, 10, 50]; // 50 is outlier
    const result = detectZScoreAnomaly(data, 2.5);
    expect(result).toBe(true);
  });
});
```

---

## 📚 Documentation

### When to Update Docs

- **New Feature:** Update README.md and relevant docs/
- **API Changes:** Update architecture.md
- **Breaking Changes:** Highlight in PR description
- **Config Changes:** Update .env.example and QUICKSTART.md

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Explain "why" not just "what"
- Add troubleshooting tips for common issues

---

## 🐛 Bug Reports

When reporting a bug, include:

1. **Description:** What happened vs what should happen
2. **Steps to Reproduce:**
   ```
   1. Start backend in real-time mode
   2. Open mobile app
   3. Wait 5 minutes
   4. Tap alert
   5. App crashes
   ```
3. **Environment:**
   - OS: Windows 11 / macOS 14 / Linux
   - Node version: 18.17.0
   - Expo version: 55.0.20
   - Device: iPhone 14 / Pixel 7
4. **Logs:** Include server logs and Expo console output
5. **Screenshots:** If UI-related

---

## 💡 Feature Requests

When suggesting a feature:

1. **Use Case:** What problem does it solve?
2. **Proposed Solution:** How should it work?
3. **Alternatives:** What other approaches did you consider?
4. **Impact:** Who benefits? How critical is it?

**Example:**
```markdown
### Feature: Push Notifications for Critical Alerts

**Use Case:** 
Technicians need immediate notification when critical anomalies occur,
even when app is in background.

**Proposed Solution:**
- Use Expo Notifications API
- Send push notification when risk score ≥ 90
- Include system name and brief summary
- Tapping notification opens alert detail screen

**Alternatives:**
- SMS notifications (more complex, costs money)
- Email notifications (slower, less attention-grabbing)

**Impact:**
- High priority for real-world deployment
- Benefits: Faster response times, prevents equipment damage
- Affects: All users in production environment
```

---

## 🔍 Code Review Process

When your PR is submitted:

1. **Automated Checks:** CI/CD runs (when set up)
2. **Maintainer Review:** Code quality, architecture fit
3. **Feedback:** Requested changes or questions
4. **Approval:** Once all concerns addressed
5. **Merge:** Maintainer merges into main branch

**Be patient!** Maintainers may take a few days to review.

---

## 🎨 UI/UX Contributions

When changing UI:

- Follow existing design patterns
- Test on both iOS and Android
- Consider different screen sizes
- Ensure accessibility (color contrast, touch targets)
- Include before/after screenshots in PR

---

## 🏗️ Architecture Guidelines

Before making large changes:

1. **Open an issue** to discuss the approach
2. **Get maintainer feedback** on design
3. **Follow existing patterns:**
   - Backend: Service layer + routes
   - Frontend: Screens + components + services
4. **Maintain separation of concerns:**
   - Data sources (CSV vs real-time)
   - Detection (deterministic) vs AI (explanations)
   - API layer vs business logic

---

## 📦 Dependencies

### Adding New Dependencies

Only add dependencies if:

- ✅ Solves a real problem
- ✅ Well-maintained (recent updates)
- ✅ Popular (>1k GitHub stars)
- ✅ Compatible license (MIT, Apache 2.0)
- ✅ Small bundle size

**Avoid:**
- ❌ Unmaintained packages
- ❌ GPL/AGPL licenses (not compatible)
- ❌ Massive bundles (>500KB)
- ❌ Overlapping functionality

### Example Good Addition

```json
// Good: date-fns for date formatting
{
  "dependencies": {
    "date-fns": "^2.30.0"  // Well-maintained, tree-shakeable, MIT
  }
}
```

### Example Bad Addition

```json
// Bad: Moment.js is deprecated and huge
{
  "dependencies": {
    "moment": "^2.29.4"  // Deprecated, 288KB, avoid
  }
}
```

---

## 🚫 What NOT to Contribute

Please **don't** submit PRs for:

- ❌ Reformatting existing code (unless agreed upon)
- ❌ Adding your favorite linter config
- ❌ Changing tech stack without discussion
- ❌ Breaking changes without migration path
- ❌ Personal configuration preferences
- ❌ Anything that violates our code of conduct

---

## 📧 Questions?

- **General Questions:** Open a GitHub Discussion
- **Bug Reports:** Open an Issue
- **Security Issues:** Email maintainers privately (don't open public issue)

---

## 🙏 Recognition

All contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation (for significant contributions)

---

## 📜 Code of Conduct

### Our Standards

**Positive Behavior:**
- ✅ Be respectful and constructive
- ✅ Welcome newcomers
- ✅ Focus on what's best for the project
- ✅ Show empathy

**Unacceptable Behavior:**
- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Personal attacks
- ❌ Publishing others' private information

**Enforcement:**
Violations may result in temporary or permanent ban from the project.

---

**Thank you for contributing! 🎉**

Your efforts help make HVAC maintenance smarter and more efficient.
