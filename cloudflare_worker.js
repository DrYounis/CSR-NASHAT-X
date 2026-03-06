// Cloudflare Worker — proxy for GitHub Actions + Claude AI content generation
// Environment variables needed:
//   GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
//   ANTHROPIC_API_KEY
//   ALLOWED_ORIGINS (comma-separated list)
//   API_SECRET_KEY (for dashboard authentication)

// Allowed origins for CORS (restrict to your domains)
const DEFAULT_ALLOWED_ORIGINS = [
  'https://nashattcsr.com',
  'https://www.nashattcsr.com',
  'https://nashat-csr.pages.dev',
];

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = env.ALLOWED_ORIGINS 
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : DEFAULT_ALLOWED_ORIGINS;
  
  const isAllowed = allowedOrigins.includes(origin) || 
                    allowedOrigins.includes('*'); // Only for dev
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Rate limiting with KV storage
async function checkRateLimit(env, identifier, limit = 100, windowSeconds = 3600) {
  if (!env.RATE_LIMITS) {
    // KV not configured, skip rate limiting (log warning in production)
    return { allowed: true, remaining: limit };
  }
  
  const key = `rate:${identifier}`;
  const current = await env.RATE_LIMITS.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= limit) {
    return { allowed: false, remaining: 0, resetIn: windowSeconds };
  }
  
  await env.RATE_LIMITS.put(key, (count + 1).toString(), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - count - 1 };
}

// Extract client IP for rate limiting
function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0] || 
         'unknown';
}

// Retry logic with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Retry on 5xx errors or rate limits
      if (response.status >= 500 || response.status === 429) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delays[i]));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      // Retry on network errors
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[i]));
        continue;
      }
      throw error;
    }
  }
  
  // Should never reach here, but just in case
  return fetch(url, options);
}

// Validate and sanitize input
function validateInput(data) {
  const errors = [];
  
  if (!data.topic || typeof data.topic !== 'string') {
    errors.push('Topic is required and must be a string');
  } else if (data.topic.length < 2 || data.topic.length > 300) {
    errors.push('Topic must be between 2 and 300 characters');
  }
  
  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  } else if (data.category && data.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }
  
  if (data.source && typeof data.source !== 'string') {
    errors.push('Source must be a string');
  } else if (data.source && data.source.length > 100) {
    errors.push('Source must be less than 100 characters');
  }
  
  if (data.style && typeof data.style !== 'string') {
    errors.push('Style must be a string');
  } else if (data.style && data.style.length > 50) {
    errors.push('Style must be less than 50 characters');
  }
  
  // Sanitize: trim all string inputs
  const sanitized = {
    topic: data.topic?.trim(),
    category: data.category?.trim(),
    source: data.source?.trim(),
    style: data.style?.trim(),
  };
  
  return { errors, sanitized };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed, use POST" }, 405, corsHeaders);
    }

    // Rate limiting by IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(env, clientIP, 100, 3600); // 100 requests/hour
    
    if (!rateLimit.allowed) {
      return json({ 
        error: 'Rate limit exceeded', 
        message: `Too many requests. Limit: 100/hour. Try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
        remaining: rateLimit.remaining 
      }, 429, corsHeaders);
    }

    // Add rate limit headers to all responses
    const responseHeaders = {
      ...corsHeaders,
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': (Date.now() + rateLimit.resetIn * 1000).toString(),
    };

    if (url.pathname === "/generate") {
      return handleGenerate(request, env, responseHeaders);
    }

    if (url.pathname === "/tweet") {
      return handleCustomTweet(request, env, responseHeaders);
    }
    
    if (url.pathname === "/health") {
      return json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        rateLimit: { remaining: rateLimit.remaining }
      }, 200, responseHeaders);
    }

    // Default: trigger GitHub Actions dispatch
    return handleDispatch(env, responseHeaders);
  },
};

async function handleDispatch(env, corsHeaders) {
  try {
    const ghUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;
    
    // GitHub API call with retry
    const response = await fetchWithRetry(ghUrl, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "RamadanBot-Worker",
      },
      body: JSON.stringify({ event_type: "employee_manual_post" }),
    });

    if (response.ok) {
      return json({ ok: true }, 200, corsHeaders);
    } else {
      const err = await response.text();
      return json({ ok: false, error: err }, 502, corsHeaders);
    }
  } catch (e) {
    return json({ ok: false, error: e.message }, 500, corsHeaders);
  }
}

async function handleCustomTweet(request, env, corsHeaders) {
  try {
    // Optional: Validate API key for tweet endpoint
    if (env.API_SECRET_KEY) {
      const apiKey = request.headers.get('X-API-Key');
      if (!apiKey || apiKey !== env.API_SECRET_KEY) {
        return json({ 
          ok: false, 
          error: 'Invalid or missing API key' 
        }, 401, corsHeaders);
      }
    }

    // Parse and validate request body
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      return json({ 
        ok: false, 
        error: 'Invalid JSON in request body' 
      }, 400, corsHeaders);
    }

    const { text } = data;
    
    // Validate tweet text
    if (!text || typeof text !== 'string') {
      return json({ 
        ok: false, 
        error: 'Tweet text is required and must be a string' 
      }, 400, corsHeaders);
    }
    
    if (text.length > 280) {
      return json({ 
        ok: false, 
        error: `Tweet exceeds 280 character limit (current: ${text.length})` 
      }, 400, corsHeaders);
    }
    
    if (text.length < 5) {
      return json({ 
        ok: false, 
        error: 'Tweet text is too short (minimum 5 characters)' 
      }, 400, corsHeaders);
    }

    const ghUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;
    
    // GitHub API call with retry
    const response = await fetchWithRetry(ghUrl, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "RamadanBot-Worker",
      },
      body: JSON.stringify({
        event_type: "custom_tweet",
        client_payload: { tweet_text: text },
      }),
    });

    if (response.ok) {
      return json({ ok: true, message: 'Tweet queued for posting' }, 200, corsHeaders);
    } else {
      const err = await response.text();
      return json({ ok: false, error: err }, 502, corsHeaders);
    }
  } catch (e) {
    return json({ ok: false, error: e.message }, 500, corsHeaders);
  }
}

async function handleGenerate(request, env, corsHeaders) {
  // Validate ANTHROPIC_API_KEY is configured
  if (!env.ANTHROPIC_API_KEY) {
    return json({
      ok: false,
      error: 'AI service not configured. Please contact administrator.'
    }, 500, corsHeaders);
  }

  try {
    // Parse and validate request body
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      return json({ 
        ok: false, 
        error: 'Invalid JSON in request body' 
      }, 400, corsHeaders);
    }

    // Validate input
    const { errors, sanitized } = validateInput(data);
    if (errors.length > 0) {
      return json({ 
        ok: false, 
        error: 'Validation failed',
        details: errors 
      }, 400, corsHeaders);
    }

    const { topic, category, source, style } = sanitized;

    const systemPrompt = `أنت خبير محتوى رياضي عربي متخصص في منصة X (تويتر سابقاً). تكتب بالعربية الفصحى مع لمسة خليجية حديثة. خبرتك تشمل: التغذية الرياضية، التمارين، الأحاديث النبوية عن الرياضة والصحة، والمحتوى التحفيزي الرياضي.

يجب أن ترد دائماً بصيغة JSON فقط بدون أي نص إضافي.`;

    const userPrompt = `اكتب 3 منشورات عربية احترافية جاهزة للنشر على X.

الموضوع: ${topic}
الفئة: ${category || "عام"}
المرجع/المصدر: ${source || "رياضة عامة"}
الأسلوب: ${style || "تحفيزي"}

لكل منشور أعطني:
1. "text": نص المنشور مع هاشتاقات (أقل من 280 حرف إجمالاً)
2. "hook": عامل الجذب - ما الذي يجعل المتابع يتوقف عند هذا المنشور
3. "engagement_tip": نصيحة لزيادة التفاعل مع هذا المنشور
4. "best_time": أفضل وقت لنشره بتوقيت السعودية
5. "char_count": عدد أحرف نص المنشور

أعد الإجابة بصيغة JSON هكذا فقط:
{"posts": [{"text": "...", "hook": "...", "engagement_tip": "...", "best_time": "...", "char_count": 0}]}`;

    // Call Anthropic API with retry logic
    const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return json({ ok: false, error: err }, 502, corsHeaders);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from Claude's response
    let posts;
    try {
      const parsed = JSON.parse(content);
      posts = parsed.posts || parsed;
    } catch {
      // Try extracting JSON from markdown code block
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        posts = parsed.posts || parsed;
      } else {
        return json({ ok: false, error: "Failed to parse AI response", raw: content }, 502, corsHeaders);
      }
    }

    return json({ ok: true, posts }, 200, corsHeaders);
  } catch (e) {
    return json({ ok: false, error: e.message }, 500, corsHeaders);
  }
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
