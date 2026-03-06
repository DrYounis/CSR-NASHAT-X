# 🔒 Security Documentation

## Security Measures Implemented

This document outlines all security measures implemented in the Ramadan Sports Bot project.

---

## ✅ Implemented Security Controls

### 1. **Environment Variables Management**

All sensitive credentials are stored in environment variables, never in code.

**Protected Secrets:**
- Twitter/X API credentials
- GitHub Personal Access Token
- Anthropic API Key
- CORS allowed origins
- API Secret Key for dashboard

**Files:**
- `.env` - Actual credentials (NEVER commit to Git)
- `.env.example` - Template with dummy values

### 2. **Rate Limiting**

**Cloudflare Worker Rate Limits:**
- **100 requests per hour** per IP address
- Uses Cloudflare KV storage for tracking
- Returns `429 Too Many Requests` when exceeded

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: [remaining requests]
X-RateLimit-Reset: [Unix timestamp when limit resets]
```

**Configuration:**
```javascript
// In wrangler.toml, add KV namespace:
[[kv_namespaces]]
binding = "RATE_LIMITS"
id = "your-kv-namespace-id"
```

### 3. **CORS (Cross-Origin Resource Sharing)**

**Restricted Origins:**
- Default allowed: `nashattcsr.com`, `nashat-csr.pages.dev`
- Configurable via `ALLOWED_ORIGINS` environment variable
- Rejects requests from unauthorized origins

**For Development:**
- Set `ALLOWED_ORIGINS=*` (only in development!)

### 4. **Input Validation**

**All API endpoints validate:**

| Endpoint | Validations |
|----------|-------------|
| `/generate` | - Topic: required, 2-300 chars<br>- Category: optional, max 50 chars<br>- Source: optional, max 100 chars<br>- Style: optional, max 50 chars |
| `/tweet` | - Text: required, 5-280 chars<br>- Must be valid string |

**Validation Errors:**
```json
{
  "ok": false,
  "error": "Validation failed",
  "details": ["Topic is required and must be a string"]
}
```

### 5. **API Authentication**

**Dashboard Authentication:**
- SHA-256 hash-based login
- Session storage for authenticated state
- Optional: API key validation via `X-API-Key` header

**Protected Endpoints:**
- `/tweet` - Requires `X-API-Key` header (if `API_SECRET_KEY` is configured)

**Usage:**
```javascript
fetch('https://your-worker.workers.dev/tweet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-key'
  },
  body: JSON.stringify({ text: 'Tweet content...' })
});
```

### 6. **Content Security**

**Tweet Content:**
- Maximum 280 characters (Twitter limit enforced)
- Minimum 5 characters (prevents spam)
- Validated before sending to Twitter API

**AI-Generated Content:**
- Sanitized input before sending to Anthropic
- Validated output before displaying to users

### 7. **Error Handling**

**Secure Error Messages:**
- Generic messages for users
- Detailed logs server-side only
- No stack traces exposed to clients

**Example:**
```javascript
// Client sees:
{ error: 'AI service not configured. Please contact administrator.' }

// Server logs:
{ error: 'ANTHROPIC_API_KEY is undefined' }
```

### 8. **Health Check Endpoint**

**`/health` endpoint:**
- Returns service status
- Shows rate limit remaining
- No sensitive information exposed

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-03-06T12:00:00.000Z",
  "rateLimit": { "remaining": 95 }
}
```

---

## 🔧 Configuration Guide

### Cloudflare Worker Setup

**1. Deploy Worker:**
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

**2. Set Environment Variables:**
```bash
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put API_SECRET_KEY
wrangler secret put ALLOWED_ORIGINS
```

**3. Create KV Namespace for Rate Limiting:**
```bash
wrangler kv:namespace create RATE_LIMITS
# Copy the ID and add to wrangler.toml
```

**4. Update wrangler.toml:**
```toml
[[kv_namespaces]]
binding = "RATE_LIMITS"
id = "your-kv-namespace-id"
```

---

## 🚨 Security Best Practices

### DO ✅
- Rotate API keys every 90 days
- Use strong, random `API_SECRET_KEY` (32+ characters)
- Keep `.env` file out of version control
- Review rate limit logs weekly
- Update dependencies monthly
- Use HTTPS for all endpoints
- Test in staging before production

### DON'T ❌
- Never commit `.env` to Git
- Never use `ALLOWED_ORIGINS=*` in production
- Never share API keys via email/chat
- Never skip input validation
- Never expose error stack traces
- Never disable rate limiting in production

---

## 📊 Monitoring

### What to Monitor

1. **Rate Limit Hits**
   - Check `X-RateLimit-Remaining` headers
   - Alert if >50% of users hit limit

2. **Error Rates**
   - Monitor 4xx and 5xx responses
   - Alert on sudden spikes

3. **API Costs**
   - Track Anthropic API usage
   - Set budget alerts

4. **Authentication Failures**
   - Monitor failed login attempts
   - Alert on brute force patterns

### Logging

**Cloudflare Logs:**
```bash
wrangler tail
```

**Key Log Events:**
- Rate limit exceeded
- Invalid API key
- Validation failures
- Twitter API errors

---

## 🛡️ Incident Response

### If API Key is Compromised

1. **Immediately:**
   - Rotate the compromised key
   - Update Cloudflare secrets
   - Review logs for unauthorized access

2. **Within 24 hours:**
   - Audit all recent API calls
   - Check for unusual patterns
   - Notify affected users if needed

3. **Within 1 week:**
   - Document the incident
   - Update security procedures
   - Implement additional controls

### If Rate Limit is Abused

1. **Identify the source IP**
2. **Block at Cloudflare level** (if needed)
3. **Review and adjust limits**
4. **Implement CAPTCHA** (if persistent)

---

## 📋 Security Checklist

### Pre-Deployment
- [ ] All secrets in environment variables
- [ ] `.env` added to `.gitignore`
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] KV namespace created
- [ ] API_SECRET_KEY generated (32+ chars)
- [ ] Error handling tested

### Post-Deployment
- [ ] Health endpoint responds
- [ ] Rate limiting works (test with multiple requests)
- [ ] CORS rejects unauthorized origins
- [ ] API key validation works
- [ ] Input validation rejects bad data
- [ ] Logs are being captured

### Monthly
- [ ] Review rate limit logs
- [ ] Check for dependency updates
- [ ] Audit API usage patterns
- [ ] Rotate API keys (every 90 days)
- [ ] Test all security controls

---

## 🔐 Generating Secure Keys

### API_SECRET_KEY

**macOS/Linux:**
```bash
openssl rand -hex 32
```

**Windows PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online (for quick testing only):**
- https://randomkeygen.com/
- https://1password.com/password-generator/

---

## 📞 Security Contact

**Reporting Vulnerabilities:**
- Email: [your-security-email@domain.com]
- Response time: Within 48 hours
- Include: Description, steps to reproduce, impact

**Preferred Encryption:**
- PGP Key: [link to your PGP key]
- Fingerprint: [your PGP fingerprint]

---

## 📚 Additional Resources

- [Cloudflare Workers Security Best Practices](https://developers.cloudflare.com/workers/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Twitter API Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [Anthropic API Security](https://docs.anthropic.com/claude/reference/security)

---

**Last Updated:** March 6, 2025  
**Version:** 1.0.0
