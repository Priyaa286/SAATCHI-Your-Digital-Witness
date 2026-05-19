import { useState } from "react";
import { sha256, classifyWithClaude, insertIncident, detectPlatform, caseId } from "../lib/supabase";

const C = {
  bg: "#0a0c10", surface: "#111318", border: "#1e2330",
  accent: "#00e5ff", purple: "#7c3aed", text: "#e8eaf6",
  muted: "#6b7280", success: "#00d68f", danger: "#ff4757"
};

const PLATFORMS = ["Twitter/X", "Instagram", "Facebook", "TikTok", "YouTube", "Reddit", "Snapchat", "WhatsApp", "Discord", "Other"];

const STEPS_DEF = [
  { label: "Saving metadata", icon: "🔍" },
  { label: "Generating SHA-256 hash", icon: "🔐" },
  { label: "AI classification", icon: "🤖" },
  { label: "Encrypting & saving to vault", icon: "🗄️" },
];

export default function AddIncidentModal({ user, onClose, onAdded }) {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [senders, setSenders] = useState("");
  const [step, setStep] = useState(0); // 0=form, 1-4=progress, 5=done
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUrlChange = (v) => {
    setUrl(v);
    const p = detectPlatform(v);
    if (p) setPlatform(p);
  };

  const handleSubmit = async () => {
    if (!url.trim()) { setError("Evidence URL is required."); return; }
    if (!platform) { setError("Please select the platform."); return; }
    setError(""); setLoading(true);

    const delay = ms => new Promise(r => setTimeout(r, ms));

    try {
      setStep(1); await delay(500);

      const ts = new Date().toISOString();
      const hashInput = JSON.stringify({ url, platform, description, ts, userId: user.id });

      setStep(2); await delay(400);
      const hash = await sha256(hashInput);

      setStep(3); await delay(300);
      const classification = await classifyWithClaude(url, platform, description);

      setStep(4); await delay(400);
      const record = {
        user_id: user.id,
        url: url.trim(),
        platform,
        title: description.trim() || `${platform} incident`,
        description: description.trim(),
        sender_info: senders.split(",").map(s => s.trim()).filter(Boolean),
        severity: classification.severity,
        category: classification.category,
        summary: classification.summary,
        recommended_action: classification.recommended_action,
        ai_confidence: classification.confidence,
        sha256_hash: hash,
        captured_at: ts
      };

      const saved = await insertIncident(record);
      setResult(saved || record);
      setStep(5);
      onAdded(saved || record);
    } catch (e) {
      setError(e.message || "Failed to save incident. Check your Supabase config.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>

      {/* Sheet */}
      <div style={{ width: "100%", maxWidth: "480px", background: C.surface, borderRadius: "20px 20px 0 0", border: `1px solid ${C.border}`, borderBottom: "none", maxHeight: "92vh", overflowY: "auto", animation: "slideUp 0.25s ease" }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", background: C.border, borderRadius: "2px" }} />
        </div>

        {step === 5 && result ? (
          // ── SUCCESS STATE ──
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
            <h2 style={{ color: C.success, fontFamily: "monospace", fontSize: "17px", marginBottom: "8px" }}>EVIDENCE SECURED</h2>
            <p style={{ color: C.muted, fontSize: "12px", marginBottom: "20px" }}>Case ID: <span style={{ fontFamily: "monospace", color: C.accent }}>{caseId(result)}</span></p>
            <div style={{ background: C.bg, border: `1px solid ${C.success}33`, borderRadius: "12px", padding: "14px", marginBottom: "20px", textAlign: "left" }}>
              <div style={{ fontSize: "9px", color: C.success, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>SHA-256 Hash</div>
              <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#4ade80", wordBreak: "break-all", lineHeight: "1.7" }}>{result.sha256_hash}</div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "13px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", color: C.text, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                Close
              </button>
              <button onClick={() => { setUrl(""); setPlatform(""); setDescription(""); setSenders(""); setStep(0); setResult(null); }}
                style={{ flex: 1, padding: "13px", background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", borderRadius: "12px", color: "white", fontFamily: "monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer" }}>
                + ADD ANOTHER
              </button>
            </div>
          </div>

        ) : (
          // ── FORM STATE ──
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: C.text, fontSize: "16px", fontWeight: "700", margin: "0 0 4px" }}>Add Incident</h2>
                <p style={{ color: C.muted, fontSize: "11px", margin: 0 }}>Evidence will be hashed & saved to your vault</p>
              </div>
              {!loading && <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: "20px", cursor: "pointer", padding: "0" }}>✕</button>}
            </div>

            {/* URL */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Evidence URL *</label>
              <input value={url} onChange={e => handleUrlChange(e.target.value)} placeholder="https://instagram.com/p/..." disabled={loading}
                style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${url ? C.accent : C.border}`, borderRadius: "10px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box", transition: "border 0.15s" }} />
            </div>

            {/* Platform */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>Platform *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatform(p)} disabled={loading} style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "600", border: platform === p ? `1px solid ${C.accent}` : `1px solid ${C.border}`, borderRadius: "20px", cursor: "pointer", background: platform === p ? "rgba(0,229,255,0.1)" : "transparent", color: platform === p ? C.accent : C.muted, transition: "all 0.15s" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>What happened? *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the harassment incident in detail..." rows={3} disabled={loading}
                style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text, fontSize: "13px", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5" }} />
            </div>

            {/* Senders */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Sender / Username(s) <span style={{ color: "#374151" }}>(optional, comma-separated)</span></label>
              <input value={senders} onChange={e => setSenders(e.target.value)} placeholder="@username1, @username2" disabled={loading}
                style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Error */}
            {error && <div style={{ background: "rgba(255,71,87,0.1)", border: `1px solid ${C.danger}40`, borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: C.danger }}>⚠️ {error}</div>}

            {/* Progress */}
            {step > 0 && step < 5 && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                {STEPS_DEF.map((s, i) => {
                  const idx = i + 1;
                  const done = step > idx;
                  const active = step === idx;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0", opacity: done || active ? 1 : 0.3 }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", border: `1px solid ${done ? C.success : active ? C.accent : C.border}`, background: done ? "rgba(0,214,143,0.1)" : active ? "rgba(0,229,255,0.08)" : "transparent", flexShrink: 0, color: done ? C.success : active ? C.accent : C.muted }}>
                        {done ? "✓" : active ? "⟳" : idx}
                      </div>
                      <span style={{ fontSize: "12px", color: done ? C.success : active ? C.text : C.muted }}>{s.icon} {s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "15px", background: loading ? "#374151" : `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", borderRadius: "13px", color: "white", fontFamily: "monospace", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: loading ? "none" : `0 4px 20px rgba(124,58,237,0.3)` }}>
              {loading ? "PROCESSING..." : "⚡ CAPTURE & HASH EVIDENCE"}
            </button>
            <p style={{ textAlign: "center", fontSize: "10px", color: C.muted, marginTop: "10px" }}>🔒 Hashed locally before upload · Only you can see this</p>
          </div>
        )}
      </div>
    </div>
  );
}
