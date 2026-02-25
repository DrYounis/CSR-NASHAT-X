# 🔒 UNIVERSAL AI SECURITY AUDIT & IMPLEMENTATION PROMPT
## Copy-Paste This Entire Prompt to AI Coding Assistants

---

# SECURITY AUDIT & AUTO-FIX REQUEST

I need you to perform a comprehensive security audit on my project and implement fixes for all issues found. This is for an AI coding agency project, so pay special attention to AI-generated code vulnerabilities.

## 📋 PROJECT CONTEXT

**Fill in your project details:**

```
PROJECT TYPE: [Web App / Mobile App / API / Full Stack / Other]
TECH STACK:
- Backend: [e.g., Node.js + Express, Python + Django, etc.]
- Frontend: [e.g., React, Vue, Angular, Vanilla JS]
- Database: [e.g., PostgreSQL, MongoDB, MySQL]
- AI Services: [e.g., OpenAI GPT-4, Anthropic Claude, None]
- Hosting: [e.g., AWS, Heroku, Vercel, Docker]
- Language Versions: [e.g., Node 18, Python 3.11]

PROJECT STRUCTURE:
- Root directory: [path]
- Source code: [e.g., /src, /app]
- Config files: [e.g., /config]
- Environment: [e.g., .env location]
- Database models: [e.g., /models]
- Routes/Controllers: [e.g., /routes, /api]

CURRENT SECURITY STATE:
- Authentication: [What you have: JWT, Session, OAuth, None]
- Input Validation: [Library used: Joi, Yup, None]
- Code Origin: [Fully AI-generated / Partially / Human-written]
- AI Tools Used: [Claude, ChatGPT, Copilot, Cursor, etc.]
```

---

## 🎯 AUDIT & FIX INSTRUCTIONS

Perform the following security audit and implement ALL fixes automatically:

### PHASE 1: SCAN & IDENTIFY (DO THIS FIRST)

**1.1 Scan for Hardcoded Secrets**
```
Search entire codebase for:
- API keys (patterns: sk-, api_key, apiKey, API_KEY)
- Database credentials (password, db_password, DB_PASS)
- JWT secrets (jwt_secret, JWT_SECRET, secret)
- Third-party tokens (access_token, auth_token)
- Encryption keys (encryption_key, secret_key)

List EVERY file and line number where secrets are found.
```

**1.2 Scan for SQL Injection Vulnerabilities**
```
Find all database queries that use:
- String concatenation (${}, +, f-strings with variables)
- Raw SQL with user input
- .query() or .execute() with unparameterized values
- ORM methods used incorrectly

List EVERY vulnerable query location.
```

**1.3 Scan for XSS Vulnerabilities**
```
Find all instances of:
- innerHTML with user data
- dangerouslySetInnerHTML in React
- eval() or Function() constructor
- document.write() with user input
- Unescaped template variables
- Direct DOM manipulation with user content

List EVERY vulnerable location.
```

**1.4 Scan for Missing Input Validation**
```
Check EVERY API endpoint/route for:
- Missing validation on user inputs
- No type checking
- No length limits
- No format validation
- Missing sanitization

List EVERY endpoint missing validation.
```

**1.5 Scan for Authentication/Authorization Issues**
```
Check for:
- Endpoints without authentication middleware
- Missing authorization checks
- Password storage (must be bcrypt/Argon2, not MD5/SHA1/plain)
- Missing rate limiting on auth endpoints
- Weak password requirements
- No session expiration
- Missing CSRF protection

List EVERY auth issue found.
```

**1.6 Scan for Insecure Dependencies**
```
Run dependency scanner:
- npm audit (Node.js)
- pip-audit (Python)
- bundle audit (Ruby)
- Or equivalent for your stack

List ALL vulnerabilities with severity levels.
```

**1.7 Scan for API Security Issues**
```
Check for:
- CORS set to allow all origins (*)
- Missing rate limiting
- No API authentication
- Excessive data exposure in responses
- Missing security headers
- Error messages exposing internals

List EVERY API security issue.
```

**1.8 Scan for AI-Specific Issues**
```
Check for:
- OpenAI/Anthropic API keys hardcoded
- No rate limiting on AI API calls
- User data sent to AI without sanitization
- AI responses used without validation
- No error handling for AI API failures
- Missing cost controls for AI usage

List EVERY AI-specific issue.
```

---

### PHASE 2: IMPLEMENT FIXES (DO THIS AFTER PHASE 1)

After completing the scan, implement ALL fixes below:

**2.1 FIX: Move ALL Secrets to Environment Variables**
```
For EVERY hardcoded secret found:

1. Create/update .env file with:
   - All API keys
   - Database credentials
   - JWT secrets
   - Third-party tokens

2. Update code to use environment variables:
   - Node.js: process.env.VARIABLE_NAME
   - Python: os.getenv('VARIABLE_NAME')
   - PHP: $_ENV['VARIABLE_NAME']

3. Create .env.example with dummy values

4. Ensure .env is in .gitignore

5. Update README with environment setup instructions

SHOW ME:
- Complete .env.example file
- All code changes to use env vars
- Updated .gitignore
```

**2.2 FIX: Eliminate ALL SQL Injection Vulnerabilities**
```
For EVERY SQL injection vulnerability:

1. Replace string concatenation with parameterized queries:
   - Use prepared statements
   - Use ORM methods correctly
   - Escape user input if raw SQL is necessary

2. Add input validation before database operations

SHOW ME:
- Before/after code for each fix
- Validation schemas added
- Test cases to verify fixes
```

**2.3 FIX: Eliminate ALL XSS Vulnerabilities**
```
For EVERY XSS vulnerability:

1. Replace dangerous patterns:
   - innerHTML → textContent or sanitize with DOMPurify
   - dangerouslySetInnerHTML → proper escaping or sanitization
   - eval() → safe alternatives
   - Direct DOM manipulation → safe methods

2. Add Content Security Policy headers

3. Implement output encoding

SHOW ME:
- All code replacements
- CSP configuration
- HTML sanitization library setup
```

**2.4 FIX: Add Input Validation to ALL Endpoints**
```
For EVERY endpoint missing validation:

1. Install validation library:
   - Node.js: Joi, express-validator, or Yup
   - Python: Pydantic, marshmallow, or cerberus
   - Other: recommend and install appropriate library

2. Create validation schemas for each endpoint:
   - Type validation
   - Length limits
   - Format validation (email, phone, URL)
   - Whitelist allowed values
   - File upload restrictions

3. Add validation middleware to routes

4. Return clear error messages for invalid input

SHOW ME:
- Validation library installation
- Complete validation schemas
- Middleware implementation
- Updated routes with validation
- Example error responses
```

**2.5 FIX: Secure Authentication & Authorization**
```
Implement/fix authentication:

1. Password Hashing:
   - Install bcrypt or Argon2
   - Hash all passwords with proper salt
   - Update registration/login code
   - Provide migration script for existing passwords

2. JWT/Session Security:
   - Generate strong secrets
   - Set proper expiration (15min access, 7d refresh)
   - Implement token refresh logic
   - Add session regeneration on login
   - Implement proper logout

3. Rate Limiting:
   - Install rate limiting library
   - Apply to auth endpoints (5 attempts per 15min)
   - Apply to general API (100 requests per hour)
   - Return 429 status on limit exceeded

4. Authorization Middleware:
   - Create role-based middleware
   - Apply to ALL protected routes
   - Check resource ownership before access
   - Implement principle of least privilege

5. Password Requirements:
   - Minimum 12 characters
   - Mix of upper, lower, numbers, symbols
   - Check against common passwords
   - Provide clear password policy to users

SHOW ME:
- Complete auth implementation
- Migration scripts
- Middleware code
- Rate limiting configuration
- Password policy validation
```

**2.6 FIX: Update Vulnerable Dependencies**
```
For ALL vulnerable dependencies:

1. Update to secure versions:
   - Run: npm update (Node.js)
   - Run: pip install --upgrade (Python)
   - Check for breaking changes

2. If major version updates required:
   - Document breaking changes
   - Update code for compatibility
   - Test thoroughly

3. Remove unused dependencies

4. Set up automated dependency scanning:
   - GitHub Dependabot
   - Snyk
   - npm audit in CI/CD

SHOW ME:
- Updated package.json/requirements.txt
- List of changes made
- CI/CD configuration for automated scans
```

**2.7 FIX: Secure API Configuration**
```
Fix ALL API security issues:

1. CORS Configuration:
   - Replace * with specific allowed origins
   - Set credentials: true only if needed
   - Limit allowed methods and headers
   - Handle preflight correctly

2. Security Headers:
   - Strict-Transport-Security
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy
   - Referrer-Policy

3. Error Handling:
   - Generic messages for users
   - Detailed logs server-side
   - No stack traces in responses
   - Custom error pages

4. Response Filtering:
   - Remove sensitive fields from API responses
   - Implement field whitelisting
   - Prevent mass assignment

SHOW ME:
- Complete CORS configuration
- All security headers
- Error handling middleware
- Response filtering examples
```

**2.8 FIX: Secure AI Service Integration**
```
For ALL AI service integrations:

1. API Key Security:
   - Move to environment variables
   - Rotate keys for production
   - Implement key rotation schedule

2. Rate Limiting:
   - Limit AI API calls per user
   - Implement queuing for high volume
   - Set cost budgets and alerts

3. Input Sanitization:
   - Remove PII before sending to AI
   - Validate and sanitize user prompts
   - Implement content filtering

4. Output Validation:
   - Validate AI responses before use
   - Sanitize AI-generated content
   - Implement fallback for failures

5. Error Handling:
   - Handle API timeouts
   - Handle rate limits
   - Provide graceful degradation

SHOW ME:
- Secure AI client implementation
- Rate limiting code
- Input/output sanitization
- Error handling with fallbacks
- Cost monitoring setup
```

**2.9 FIX: Add Comprehensive Logging**
```
Implement security logging:

1. Log Security Events:
   - Login attempts (success/failure)
   - Authorization failures
   - Password changes
   - Privilege escalations
   - API rate limit hits
   - Suspicious activity

2. Structured Logging:
   - JSON format
   - Include: timestamp, user, IP, action, result
   - Use log levels (error, warn, info, debug)

3. Sensitive Data Protection:
   - NEVER log passwords
   - NEVER log API keys
   - NEVER log full credit card numbers
   - Mask PII in logs

4. Log Storage:
   - Configure log rotation
   - Set retention policy (90 days)
   - Secure log files
   - Consider centralized logging (ELK, CloudWatch)

SHOW ME:
- Logging service implementation
- Example log entries
- Sensitive data masking functions
- Log rotation configuration
```

**2.10 FIX: Add Security Testing**
```
Set up automated security testing:

1. Unit Tests for Security:
   - Test authentication/authorization
   - Test input validation
   - Test SQL injection prevention
   - Test XSS prevention

2. Integration Tests:
   - Test auth flows
   - Test rate limiting
   - Test error handling

3. CI/CD Security Checks:
   - SAST (Static Application Security Testing)
   - Dependency scanning
   - Secret scanning
   - Linting with security rules

SHOW ME:
- Security test suite
- CI/CD pipeline configuration
- Testing coverage report
```

---

### PHASE 3: DOCUMENTATION & VERIFICATION

**3.1 Create Security Documentation**
```
Generate:

1. SECURITY.md file containing:
   - Security measures implemented
   - How to report vulnerabilities
   - Security contact information
   - Incident response process

2. Updated README.md with:
   - Environment setup instructions
   - Security best practices for developers
   - Required environment variables

3. .env.example with ALL required variables (dummy values)

4. Deployment checklist with security items
```

**3.2 Security Audit Report**
```
Provide comprehensive report:

VULNERABILITIES FOUND:
- Critical: [count and list]
- High: [count and list]
- Medium: [count and list]
- Low: [count and list]

FIXES IMPLEMENTED:
- [List all fixes with file locations]

REMAINING RISKS:
- [Any issues that couldn't be auto-fixed]

RECOMMENDATIONS:
- [Additional security improvements]

TESTING PERFORMED:
- [What was tested and results]
```

---

## ✅ DELIVERABLES REQUIRED

Provide me with:

1. **Complete Audit Report** (markdown format)
   - All vulnerabilities found
   - Severity ratings
   - Locations in code

2. **All Fixed Code Files**
   - Show exact changes made
   - Before/after comparisons
   - File paths

3. **New Configuration Files**
   - .env.example
   - Security headers config
   - Rate limiting config
   - CORS configuration
   - Logging configuration

4. **Migration Scripts** (if needed)
   - Database migrations
   - Password hash updates
   - Data cleanup

5. **Updated Documentation**
   - SECURITY.md
   - Updated README.md
   - API documentation with security notes

6. **Testing Suite**
   - Security unit tests
   - Integration tests
   - CI/CD configuration

7. **Deployment Checklist**
   - Pre-deployment security tasks
   - Environment variable setup
   - SSL/TLS configuration
   - Monitoring setup

---

## ⚠️ CRITICAL REQUIREMENTS

**YOU MUST:**

✅ Fix EVERY issue found (not just document them)
✅ Maintain existing functionality (don't break the app)
✅ Preserve current code structure (minimal refactoring)
✅ Provide working, tested code
✅ Include clear comments explaining security changes
✅ Generate migration scripts for breaking changes
✅ Create .env.example with ALL variables needed
✅ Test that the app still works after fixes

**YOU MUST NOT:**

❌ Skip any vulnerabilities found
❌ Break existing features
❌ Leave secrets in code
❌ Use deprecated security patterns
❌ Implement partial fixes
❌ Ignore edge cases
❌ Leave TODO comments without implementing

---

## 🔍 SPECIAL FOCUS AREAS FOR AI-GENERATED CODE

Since this code may be AI-generated, pay EXTRA attention to:

1. **Hardcoded Secrets** (AI loves to hardcode examples)
2. **SQL Injection** (AI often uses string concatenation)
3. **Missing Input Validation** (AI trusts user input)
4. **Overly Permissive CORS** (AI defaults to allow all)
5. **Weak Authentication** (AI skips rate limiting)
6. **Generic Error Handling** (AI uses catch-all try/catch)
7. **Missing Authorization Checks** (AI forgets ownership verification)
8. **Deprecated Libraries** (AI uses old training data)
9. **Insecure Defaults** (AI prioritizes convenience)
10. **Missing Edge Cases** (AI doesn't anticipate all attacks)

---

## 📊 OUTPUT FORMAT

Structure your response as:

```markdown
# SECURITY AUDIT & FIX REPORT

## EXECUTIVE SUMMARY
- Total vulnerabilities: X
- Critical: X | High: X | Medium: X | Low: X
- All fixes implemented: YES/NO
- App functionality preserved: YES/NO

## PHASE 1: VULNERABILITIES FOUND

### Critical Issues
1. [Issue description]
   - Location: [file:line]
   - Risk: [what could happen]
   - Fix: [what was done]

### High Issues
[Same format]

### Medium Issues
[Same format]

### Low Issues
[Same format]

## PHASE 2: FIXES IMPLEMENTED

### 2.1 Secrets Management
[Show changes]

### 2.2 SQL Injection Fixes
[Show changes]

### 2.3 XSS Prevention
[Show changes]

### 2.4 Input Validation
[Show changes]

### 2.5 Authentication/Authorization
[Show changes]

### 2.6 Dependencies Updated
[Show changes]

### 2.7 API Security
[Show changes]

### 2.8 AI Service Security
[Show changes]

### 2.9 Logging Implementation
[Show changes]

### 2.10 Testing Suite
[Show changes]

## PHASE 3: DOCUMENTATION

### Security.md
[Full content]

### Updated README.md
[Relevant sections]

### .env.example
[Full content]

### Deployment Checklist
[Full checklist]

## VERIFICATION

### Tests Run
- [List all tests performed]

### Manual Verification
- [What was manually checked]

### Remaining Manual Steps
- [Anything that needs human intervention]

## RECOMMENDATIONS

### Immediate Actions Required
1. [Action needed]

### Short-term Improvements (1 week)
1. [Improvement]

### Long-term Improvements (1 month)
1. [Improvement]

## METRICS

- Files modified: X
- Lines changed: X
- Security tests added: X
- Dependencies updated: X
- Time to implement: [estimate]
```

---

## 🚀 START THE AUDIT NOW

Begin with Phase 1 and work through all phases systematically. Show me everything you find and every fix you implement.

**Ready? Start scanning now!**
