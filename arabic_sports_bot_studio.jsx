import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "تحفيز", label: "تحفيز 💪", color: "#FF6B35" },
  { id: "نصائح_تدريب", label: "نصائح تدريب 🏋️", color: "#4ECDC4" },
  { id: "تغذية", label: "تغذية 🥗", color: "#45B7D1" },
  { id: "احاديث_نبوية", label: "أحاديث نبوية 📿", color: "#96CEB4" },
  { id: "حقائق_رياضية", label: "حقائق رياضية 🧠", color: "#FFEAA7" },
  { id: "تمارين_يومية", label: "تمارين يومية 🔥", color: "#DDA0DD" },
  { id: "صحة_نفسية", label: "صحة نفسية 🧘", color: "#98D8C8" },
  { id: "رمضان", label: "رمضان 🌙", color: "#C8A2C8" },
];

const SOURCES = [
  { id: "general", label: "عام", icon: "🌐" },
  { id: "nutrition", label: "تغذية رياضية", icon: "🥗" },
  { id: "exercise", label: "تمارين وفيتنس", icon: "🏃" },
  { id: "islamic", label: "الرياضة في الإسلام", icon: "📿" },
  { id: "psychology", label: "علم النفس الرياضي", icon: "🧠" },
  { id: "trending", label: "الرياضة الإقليمية", icon: "🏆" },
];

const POST_STYLES = [
  { id: "motivational", label: "تحفيزي" },
  { id: "educational", label: "تعليمي" },
  { id: "factual", label: "معلوماتي" },
  { id: "challenge", label: "تحدي" },
  { id: "tip", label: "نصيحة سريعة" },
  { id: "question", label: "سؤال تفاعلي" },
];

export default function ArabicSportsBotStudio() {
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("تحفيز");
  const [selectedSource, setSelectedSource] = useState("general");
  const [selectedStyle, setSelectedStyle] = useState("motivational");
  const [postCount, setPostCount] = useState(3);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [researchLog, setResearchLog] = useState([]);
  const [savedPosts, setSavedPosts] = useState(() => {
    // Load saved posts from localStorage on initial render
    try {
      const stored = localStorage.getItem('savedSportsPosts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load saved posts:', e);
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState("generate");
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  const sourceContextMap = {
    general: "الرياضة بشكل عام، اللياقة البدنية، النشاط الرياضي",
    nutrition: "التغذية الرياضية، البروتين، الكربوهيدرات، الفيتامينات، الترطيب، الوجبات قبل وبعد التمرين",
    exercise: "التمارين الرياضية، روتين التدريب، HIIT، كمال الأجسام، الكارديو، تمارين المرونة",
    islamic: "الرياضة في الإسلام، الأحاديث النبوية عن الصحة والقوة، العلاقة بين الإيمان واللياقة",
    psychology: "علم النفس الرياضي، الدافعية، التركيز الذهني، الصحة النفسية والرياضة",
    trending: "الرياضة في السعودية والخليج، الأندية السعودية، الرياضيون العرب، الفعاليات الرياضية الإقليمية",
  };

  // Cloudflare Worker proxy URL - configure this to your deployed worker
  const WORKER_URL = "https://ramadan-tweet-proxy.op-younis.workers.dev";

  const generatePosts = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedPosts([]);
    setResearchLog([]);

    const logs = [];
    const addLog = (msg) => {
      logs.push({ time: new Date().toLocaleTimeString("ar-SA"), msg });
      setResearchLog([...logs]);
    };

    try {
      addLog(`🔍 البحث عن: "${topic}" في مصدر: ${SOURCES.find(s => s.id === selectedSource)?.label}`);
      addLog(`📊 تحليل الفئة: ${selectedCategory} | الأسلوب: ${POST_STYLES.find(s => s.id === selectedStyle)?.label}`);
      addLog(`⚙️ توليد ${postCount} منشورات...`);

      // Use Cloudflare Worker proxy instead of direct Anthropic call
      const response = await fetch(`${WORKER_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          category: CATEGORIES.find(c => c.id === selectedCategory)?.label,
          source: sourceContextMap[selectedSource],
          style: POST_STYLES.find(s => s.id === selectedStyle)?.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok || !data.posts) {
        throw new Error(data.error || 'Failed to generate posts');
      }

      const parsed = { posts: data.posts };

      addLog(`✅ تم الحصول على المحتوى من النموذج`);

      if (parsed.research_insights) {
        parsed.research_insights.forEach(insight => {
          addLog(`💡 رؤية: ${insight}`);
        });
      }

      addLog(`✨ تم توليد ${parsed.posts?.length || 0} منشورات بنجاح!`);
      setGeneratedPosts(parsed.posts || []);
    } catch (err) {
      setError(`حدث خطأ أثناء توليد المحتوى: ${err.message}. تأكد من الاتصال وأعد المحاولة.`);
      addLog(`❌ خطأ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPost = (post) => {
    navigator.clipboard.writeText(post.text);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const savePost = (post) => {
    const toSave = {
      ...post,
      category: selectedCategory,
      topic,
      savedAt: new Date().toLocaleDateString("ar-SA"),
    };
    const newSaved = [toSave, ...savedPosts];
    setSavedPosts(newSaved);
    // Persist to localStorage
    try {
      localStorage.setItem('savedSportsPosts', JSON.stringify(newSaved.slice(0, 50))); // Limit to 50 posts
    } catch (e) {
      console.error('Failed to save post to localStorage:', e);
    }
  };

  const removePost = (index) => {
    const newSaved = savedPosts.filter((_, i) => i !== index);
    setSavedPosts(newSaved);
    // Persist to localStorage
    try {
      localStorage.setItem('savedSportsPosts', JSON.stringify(newSaved));
    } catch (e) {
      console.error('Failed to remove post from localStorage:', e);
    }
  };

  const clearAllSaved = () => {
    setSavedPosts([]);
    try {
      localStorage.removeItem('savedSportsPosts');
    } catch (e) {
      console.error('Failed to clear saved posts:', e);
    }
  };

  const selectedCategoryColor = CATEGORIES.find(c => c.id === selectedCategory)?.color || "#FF6B35";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f1923 50%, #0a0a0f 100%)",
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      direction: "rtl",
      color: "#e8e8e8",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0a0a0f, #111827, #0a0a0f)",
        borderBottom: "1px solid #1e3a5f",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${selectedCategoryColor}, #1a3a5c)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>بوت المحتوى الرياضي</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Arabic Sports X Bot Studio</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["generate", "saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeTab === tab ? selectedCategoryColor : "#1e293b",
                color: activeTab === tab ? "#fff" : "#94a3b8",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {tab === "generate" ? "🚀 توليد" : `📌 محفوظ (${savedPosts.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {activeTab === "generate" && (
          <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 20 }}>

            {/* Left Panel - Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Topic Input */}
              <div style={{
                background: "#111827", borderRadius: 14, padding: 20,
                border: "1px solid #1e3a5f",
              }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  🔍 الموضوع أو الكلمة المفتاحية
                </label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="مثال: فوائد تمارين القرفصاء، أفضل مصادر البروتين، الرياضة في رمضان..."
                  style={{
                    width: "100%", minHeight: 80, background: "#0f172a",
                    border: "1px solid #1e3a5f", borderRadius: 10, padding: 12,
                    color: "#e8e8e8", fontSize: 14, resize: "vertical",
                    fontFamily: "inherit", direction: "rtl", boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Category */}
              <div style={{ background: "#111827", borderRadius: 14, padding: 20, border: "1px solid #1e3a5f" }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 12 }}>
                  📂 فئة المحتوى
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: selectedCategory === cat.id ? `${cat.color}22` : "#0f172a",
                        color: selectedCategory === cat.id ? cat.color : "#64748b",
                        fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                        border: selectedCategory === cat.id ? `1px solid ${cat.color}66` : "1px solid #1e3a5f",
                        transition: "all 0.2s", textAlign: "center",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div style={{ background: "#111827", borderRadius: 14, padding: 20, border: "1px solid #1e3a5f" }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 12 }}>
                  🌐 مصدر البحث
                </label>
                {SOURCES.map(src => (
                  <button
                    key={src.id}
                    onClick={() => setSelectedSource(src.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      padding: "9px 12px", marginBottom: 6, borderRadius: 8, border: "none", cursor: "pointer",
                      background: selectedSource === src.id ? "#1e3a5f" : "transparent",
                      color: selectedSource === src.id ? "#60a5fa" : "#64748b",
                      fontFamily: "inherit", fontSize: 13, textAlign: "right",
                      border: selectedSource === src.id ? "1px solid #2563eb44" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    <span>{src.icon}</span>
                    <span>{src.label}</span>
                    {selectedSource === src.id && <span style={{ marginRight: "auto", color: "#60a5fa" }}>✓</span>}
                  </button>
                ))}
              </div>

              {/* Style & Options */}
              <div style={{ background: "#111827", borderRadius: 14, padding: 20, border: "1px solid #1e3a5f" }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 12 }}>
                  ✍️ أسلوب المنشور
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                  {POST_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      style={{
                        padding: "7px 6px", borderRadius: 7, border: "none", cursor: "pointer",
                        background: selectedStyle === style.id ? selectedCategoryColor : "#0f172a",
                        color: selectedStyle === style.id ? "#fff" : "#64748b",
                        fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                        border: selectedStyle === style.id ? `1px solid transparent` : "1px solid #1e3a5f",
                        transition: "all 0.2s",
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: "#94a3b8" }}>عدد المنشورات: {postCount}</label>
                  <input type="range" min="1" max="5" value={postCount}
                    onChange={e => setPostCount(Number(e.target.value))}
                    style={{ width: 100, accentColor: selectedCategoryColor }}
                  />
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { key: "hashtags", label: "هاشتاقات", state: includeHashtags, setter: setIncludeHashtags },
                    { key: "emoji", label: "إيموجي", state: includeEmoji, setter: setIncludeEmoji },
                  ].map(opt => (
                    <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>
                      <input type="checkbox" checked={opt.state} onChange={e => opt.setter(e.target.checked)}
                        style={{ accentColor: selectedCategoryColor, width: 14, height: 14 }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generatePosts}
                disabled={isLoading || !topic.trim()}
                style={{
                  padding: "16px", borderRadius: 12, border: "none", cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
                  background: isLoading || !topic.trim()
                    ? "#1e293b"
                    : `linear-gradient(135deg, ${selectedCategoryColor}, ${selectedCategoryColor}99)`,
                  color: isLoading || !topic.trim() ? "#475569" : "#fff",
                  fontFamily: "inherit", fontSize: 15, fontWeight: 700,
                  transition: "all 0.3s",
                  boxShadow: isLoading || !topic.trim() ? "none" : `0 4px 20px ${selectedCategoryColor}44`,
                }}
              >
                {isLoading ? "⏳ جاري البحث والتوليد..." : "🚀 ابحث وأنشئ المنشورات"}
              </button>
            </div>

            {/* Right Panel - Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Research Log */}
              {researchLog.length > 0 && (
                <div style={{
                  background: "#0d1f0f", borderRadius: 14, padding: 16,
                  border: "1px solid #1a3a1a", maxHeight: 160, overflowY: "auto",
                }}>
                  <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, marginBottom: 8 }}>
                    📡 سجل البحث والمعالجة
                  </div>
                  {researchLog.map((log, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#86efac", marginBottom: 4, display: "flex", gap: 8 }}>
                      <span style={{ color: "#4ade8066", flexShrink: 0 }}>{log.time}</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                          animation: `pulse 1s ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ background: "#1f0a0a", borderRadius: 14, padding: 16, border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 14 }}>
                  ❌ {error}
                </div>
              )}

              {/* Generated Posts */}
              {generatedPosts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 14, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: selectedCategoryColor }}>✨</span>
                    تم توليد {generatedPosts.length} منشورات حول "<span style={{ color: "#e8e8e8" }}>{topic}</span>"
                  </div>
                  {generatedPosts.map((post, idx) => (
                    <PostCard
                      key={idx}
                      post={post}
                      categoryColor={selectedCategoryColor}
                      onCopy={() => copyPost(post)}
                      onSave={() => savePost(post)}
                      copied={copiedId === post.id}
                    />
                  ))}
                </div>
              ) : !isLoading && researchLog.length === 0 ? (
                <EmptyState selectedCategoryColor={selectedCategoryColor} />
              ) : null}
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, color: "#94a3b8" }}>
                📌 المنشورات المحفوظة ({savedPosts.length})
              </div>
              {savedPosts.length > 0 && (
                <button
                  onClick={clearAllSaved}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#7f1d1d", color: "#fca5a5",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  }}
                >
                  🗑️ مسح الكل
                </button>
              )}
            </div>
            {savedPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#475569", fontSize: 15 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                لا توجد منشورات محفوظة بعد. قم بتوليد منشورات وحفظها هنا!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
                {savedPosts.map((post, i) => (
                  <div key={i} style={{
                    background: "#111827", borderRadius: 14, padding: 18,
                    border: "1px solid #1e3a5f",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        {post.category} • {post.savedAt}
                      </span>
                      <button onClick={() => removePost(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 14 }}
                        title="حذف"
                      >
                        🗑
                      </button>
                    </div>
                    <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7, marginBottom: 12 }}>{post.text}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(post.text); }}
                      style={{
                        width: "100%", padding: "8px", borderRadius: 8, border: "none",
                        cursor: "pointer", background: "#1e293b", color: "#94a3b8",
                        fontFamily: "inherit", fontSize: 12,
                      }}
                    >
                      📋 نسخ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        textarea:focus { border-color: #2563eb !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function PostCard({ post, categoryColor, onCopy, onSave, copied }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#111827", borderRadius: 14, padding: 20,
      border: `1px solid ${categoryColor}33`,
      transition: "box-shadow 0.2s",
    }}>
      {/* Post Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: categoryColor, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {post.best_time === "صباح" ? "☀️ صباح" : post.best_time === "مساء" ? "🌙 مساء" : "⏰ أي وقت"}
        </span>
        <div style={{ marginRight: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={onCopy}
            style={{
              padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              background: copied ? "#16a34a22" : "#1e293b",
              color: copied ? "#4ade80" : "#94a3b8",
              fontFamily: "inherit", fontSize: 12, transition: "all 0.2s",
            }}
          >
            {copied ? "✓ تم النسخ" : "📋 نسخ"}
          </button>
          <button
            onClick={onSave}
            style={{
              padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              background: "#1e293b", color: "#94a3b8",
              fontFamily: "inherit", fontSize: 12,
            }}
          >
            📌 حفظ
          </button>
        </div>
      </div>

      {/* Post Text */}
      <div style={{
        background: "#0f172a", borderRadius: 10, padding: 16,
        marginBottom: 12, lineHeight: 1.8, fontSize: 15, color: "#e2e8f0",
        border: "1px solid #1e293b", minHeight: 80,
        whiteSpace: "pre-wrap",
      }}>
        {post.text}
      </div>

      {/* Char count */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{
          fontSize: 11, color: post.text?.length > 280 ? "#f87171" : "#4ade80",
        }}>
          {post.text?.length || 0} / 280 حرف
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 12 }}
        >
          {expanded ? "🔼 إخفاء التفاصيل" : "🔽 تفاصيل النشر"}
        </button>
      </div>

      {expanded && (
        <div style={{
          background: "#0d1929", borderRadius: 10, padding: 14,
          border: "1px solid #1e3a5f", fontSize: 12,
        }}>
          {post.hook && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "#64748b" }}>🎣 عامل الجذب: </span>
              <span style={{ color: "#94a3b8" }}>{post.hook}</span>
            </div>
          )}
          {post.engagement_tip && (
            <div>
              <span style={{ color: "#64748b" }}>💡 نصيحة تفاعل: </span>
              <span style={{ color: "#94a3b8" }}>{post.engagement_tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ selectedCategoryColor }) {
  return (
    <div style={{
      background: "#111827", borderRadius: 16, padding: 60,
      border: "1px dashed #1e3a5f", textAlign: "center",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
      <div style={{ fontSize: 18, color: "#e2e8f0", fontWeight: 600, marginBottom: 8 }}>
        جاهز للبحث والإبداع
      </div>
      <div style={{ fontSize: 14, color: "#475569", maxWidth: 320, margin: "0 auto", lineHeight: 1.7 }}>
        اكتب موضوعاً رياضياً، اختر الفئة والمصدر، ثم اضغط "ابحث وأنشئ المنشورات"
      </div>
      <div style={{
        display: "flex", justifyContent: "center", gap: 16, marginTop: 24,
        flexWrap: "wrap",
      }}>
        {["فوائد الركض 🏃", "تمارين البيت 🏠", "الكربوهيدرات 🍚", "الرياضة في رمضان 🌙"].map(example => (
          <span key={example} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12,
            background: `${selectedCategoryColor}11`,
            color: selectedCategoryColor,
            border: `1px solid ${selectedCategoryColor}33`,
          }}>
            {example}
          </span>
        ))}
      </div>
    </div>
  );
}
