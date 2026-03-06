# 🚀 Cloudflare Worker Deployment Guide

## Prerequisites
- Node.js installed ✅
- Cloudflare account (free tier works)
- Git repository with latest code ✅

---

## Step-by-Step Deployment

### Step 1: Login to Cloudflare

```bash
cd /Volumes/Elements/AG/CSR\ NASHAT\ X/ramadan_sports_bot
wrangler login
```

This will open your browser. Click "Allow" to authorize Wrangler.

---

### Step 2: Create KV Namespace for Rate Limiting

```bash
wrangler kv:namespace create RATE_LIMITS
```

**Expected output:**
```
✨ Success! Created namespace RATE_LIMITS with ID: abc123def456...
```

**⚠️ IMPORTANT:** Copy the ID! You'll need it in the next step.

---

### Step 3: Update wrangler.toml

Open `wrangler.toml` and replace `RATE_LIMITS_ID_PLACEHOLDER` with the actual ID from Step 2:

```toml
[[kv_namespaces]]
binding = "RATE_LIMITS"
id = "abc123def456..."  # ← Paste your actual ID here
```

---

### Step 4: Deploy the Worker

```bash
wrangler deploy
```

**Expected output:**
```
🌀 Building project...
🌀 Uploading...
✅ Success! Deployed to https://ramadan-tweet-proxy.<your-subdomain>.workers.dev
```

---

### Step 5: Set Environment Secrets

Run these commands one by one. You'll be prompted to enter each secret value.

#### 5.1 Anthropic API Key
```bash
wrangler secret put ANTHROPIC_API_KEY
```
Enter your Anthropic API key (starts with `sk-ant-...`)

Get one from: https://console.anthropic.com/settings/keys

---

#### 5.2 GitHub Token
```bash
wrangler secret put GITHUB_TOKEN
```
Enter your GitHub Personal Access Token

Create one at: https://github.com/settings/tokens
- Scope: `repo` (full control of private repositories)

---

#### 5.3 GitHub Owner (Your username)
```bash
wrangler secret put GITHUB_OWNER
```
Enter your GitHub username (e.g., `DrYounis`)

---

#### 5.4 GitHub Repo Name
```bash
wrangler secret put GITHUB_REPO
```
Enter your repository name (e.g., `CSR-NASHAT-X`)

---

#### 5.5 API Secret Key (for dashboard auth)
```bash
wrangler secret put API_SECRET_KEY
```

**Generate a secure key first:**

macOS/Linux:
```bash
openssl rand -hex 32
```

Or use any 32+ character random string.

---

#### 5.6 Allowed Origins (CORS)
```bash
wrangler secret put ALLOWED_ORIGINS
```

Enter your domains (comma-separated):
```
https://nashattcsr.com,https://www.nashattcsr.com,https://nashat-csr.pages.dev
```

For development only, you can use:
```
*
```

⚠️ **Don't use `*` in production!**

---

### Step 6: Verify Deployment

#### Test Health Endpoint
```bash
curl https://ramadan-tweet-proxy.<your-subdomain>.workers.dev/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-03-06T...",
  "rateLimit": { "remaining": 100 }
}
```

---

#### Test Input Validation (should fail)
```bash
curl -X POST https://ramadan-tweet-proxy.<your-subdomain>.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"x"}'
```

**Expected response (400 error):**
```json
{
  "ok": false,
  "error": "Validation failed",
  "details": ["Topic must be between 2 and 300 characters"]
}
```

---

#### Test Valid Request
```bash
curl -X POST https://ramadan-tweet-proxy.<your-subdomain>.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "فوائد الرياضة",
    "category": "تحفيز رياضي",
    "source": "رياضة عامة",
    "style": "تحفيزي"
  }'
```

---

### Step 7: Update React App

Open `arabic_sports_bot_studio.jsx` and update line 57:

```javascript
const WORKER_URL = "https://ramadan-tweet-proxy.<your-subdomain>.workers.dev";
```

Replace `<your-subdomain>` with your actual Cloudflare subdomain.

---

### Step 8: Test Rate Limiting

Run this to test rate limiting (101 requests):

```bash
for i in {1..105}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://ramadan-tweet-proxy.<your-subdomain>.workers.dev/generate \
    -H "Content-Type: application/json" \
    -d '{"topic":"test"}')
  echo "Request $i: HTTP $response"
done
```

**Expected:** First 100 requests return 200, requests 101+ return 429

---

## Troubleshooting

### Error: "Authentication required"
**Solution:** Run `wrangler login` again

---

### Error: "KV namespace not found"
**Solution:** 
1. Make sure you created the namespace (Step 2)
2. Update `wrangler.toml` with correct ID (Step 3)
3. Redeploy: `wrangler deploy`

---

### Error: "Secret not found"
**Solution:** Make sure you set all secrets (Step 5)

List all secrets:
```bash
wrangler secret list
```

---

### Worker returns 500 error
**Solution:** Check logs:
```bash
wrangler tail
```

Look for errors related to:
- Missing environment variables
- API key issues
- KV namespace problems

---

### Rate limiting not working
**Solution:** 
1. Verify KV namespace is created
2. Check `wrangler.toml` has correct binding
3. Redeploy: `wrangler deploy`

---

## Quick Deploy Script

For future deployments, use this shortcut:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying to Cloudflare..."
wrangler deploy

echo "✅ Deployment complete!"
echo "🔗 Worker URL: https://ramadan-tweet-proxy.<your-subdomain>.workers.dev"
echo ""
echo "📊 View logs: wrangler tail"
echo "🔧 Manage secrets: wrangler secret put <NAME>"
```

---

## Post-Deployment Checklist

- [ ] Worker deployed successfully
- [ ] All 6 secrets configured
- [ ] KV namespace created and bound
- [ ] Health endpoint responds
- [ ] Input validation works
- [ ] Rate limiting works (test with 101 requests)
- [ ] CORS configured for your domains
- [ ] React app updated with Worker URL
- [ ] Logs are visible (`wrangler tail`)

---

## Monitoring

### View Real-time Logs
```bash
wrangler tail
```

### View Worker Analytics
1. Go to https://dash.cloudflare.com/
2. Workers & Pages → ramadan-tweet-proxy
3. Analytics tab

### Set Up Alerts
1. Cloudflare Dashboard → Workers → Your Worker
2. Settings → Triggers
3. Add deployment or error alerts

---

## Cost Estimate

**Free Tier Includes:**
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ KV storage: 1GB read, 1000 writes/day

**Expected cost for this project:** $0/month (well within free tier)

---

## Security Reminders

- ✅ Never commit `.env` to Git
- ✅ Rotate API keys every 90 days
- ✅ Monitor rate limit logs weekly
- ✅ Use specific domains in `ALLOWED_ORIGINS` (not `*`)
- ✅ Review Cloudflare logs regularly

---

**Need help?** Check:
- `SECURITY.md` - Security documentation
- `SECURITY_FIXES_SUMMARY.md` - Audit report
- Cloudflare Docs: https://developers.cloudflare.com/workers/

---

**Last Updated:** March 6, 2025
