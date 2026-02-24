// Cloudflare Worker — proxy for GitHub Actions + Claude AI content generation
// Environment variables needed:
//   GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
//   ANTHROPIC_API_KEY

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (url.pathname === "/generate") {
      return handleGenerate(request, env, corsHeaders);
    }

    if (url.pathname === "/tweet") {
      return handleCustomTweet(request, env, corsHeaders);
    }

    // Default: trigger GitHub Actions dispatch
    return handleDispatch(env, corsHeaders);
  },
};

async function handleDispatch(env, corsHeaders) {
  try {
    const ghUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;
    const response = await fetch(ghUrl, {
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
    const { text } = await request.json();
    if (!text) {
      return json({ ok: false, error: "Tweet text is required" }, 400, corsHeaders);
    }

    const ghUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;
    const response = await fetch(ghUrl, {
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
      return json({ ok: true }, 200, corsHeaders);
    } else {
      const err = await response.text();
      return json({ ok: false, error: err }, 502, corsHeaders);
    }
  } catch (e) {
    return json({ ok: false, error: e.message }, 500, corsHeaders);
  }
}

async function handleGenerate(request, env, corsHeaders) {
  // Debug mode: Log what env keys exist (without exposing values)
  const envKeys = Object.keys(env);

  if (!env.ANTHROPIC_API_KEY) {
    return json({
      ok: false,
      error: `ANTHROPIC_API_KEY not configured. Available keys in Cloudflare: ${envKeys.join(', ')}`
    }, 500, corsHeaders);
  }

  try {
    const { topic, category, source, style } = await request.json();

    if (!topic) {
      return json({ ok: false, error: "Topic is required" }, 400, corsHeaders);
    }

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
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
