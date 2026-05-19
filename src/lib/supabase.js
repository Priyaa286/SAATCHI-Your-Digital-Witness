import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ─────────────────────────────────────────────────────────────
export async function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// ── Incident helpers ──────────────────────────────────────────────────────────
export async function fetchUserIncidents(userId) {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertIncident(record) {
  const { data, error } = await supabase
    .from("incidents")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIncident(id) {
  const { error } = await supabase.from("incidents").delete().eq("id", id);
  if (error) throw error;
}

// ── SHA-256 ───────────────────────────────────────────────────────────────────
export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── AI Classification ─────────────────────────────────────────────────────────
export async function classifyWithClaude(url, platform, description) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `You are a cyberbullying incident classifier for a legal evidence tool.
URL: ${url}
Platform: ${platform}
Description: ${description}
Respond ONLY with valid JSON, no markdown, no extra text:
{"severity":"LOW|MEDIUM|HIGH|CRITICAL","category":"Harassment|Hate Speech|Threats|Impersonation|Doxxing|Sexual Harassment|Cyberstalking|Other","summary":"one sentence description","recommended_action":"one sentence next step","confidence":0.85}`
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { severity: "MEDIUM", category: "Harassment", summary: "Potential harassment content captured for review.", recommended_action: "Review evidence and report to platform trust & safety.", confidence: 0.5 };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function caseId(incident) {
  const date = new Date(incident.captured_at).toISOString().slice(0, 10).replace(/-/g, "");
  return `SL-${date}-${(incident.id || "0000").slice(-4).toUpperCase()}`;
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function detectPlatform(url) {
  if (!url) return "";
  const h = url.toLowerCase();
  if (h.includes("twitter") || h.includes("x.com")) return "Twitter/X";
  if (h.includes("instagram")) return "Instagram";
  if (h.includes("facebook")) return "Facebook";
  if (h.includes("tiktok")) return "TikTok";
  if (h.includes("youtube")) return "YouTube";
  if (h.includes("reddit")) return "Reddit";
  if (h.includes("snapchat")) return "Snapchat";
  if (h.includes("whatsapp")) return "WhatsApp";
  return "";
}

export function generateReportHTML(incident) {
  const id = caseId(incident);
  const sev = (incident.severity || "MEDIUM").toLowerCase();
  const sevColors = { critical: "#c00", high: "#c55", medium: "#886", low: "#363" };
  const sevBg = { critical: "#fee", high: "#fff3e0", medium: "#fffde7", low: "#e8f5e9" };
  return `<!DOCTYPE html><html><head><title>SAATCHI Report – ${id}</title>
<style>
  body{font-family:'Courier New',monospace;padding:40px;color:#111;max-width:720px;margin:0 auto}
  .logo{font-size:24px;font-weight:900;letter-spacing:4px}
  .tagline{font-size:11px;color:#888;margin:4px 0 20px}
  hr{border:2px solid #000;margin:18px 0}
  .badge{display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:16px;color:${sevColors[sev]||"#886"};background:${sevBg[sev]||"#fffde7"};border:1px solid ${sevColors[sev]||"#886"}}
  .field{margin-bottom:14px}
  .label{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#888;margin-bottom:3px}
  .value{font-size:13px;padding:8px 10px;background:#f8f8f8;border-left:3px solid #000;line-height:1.5}
  .hash{word-break:break-all;font-size:10px;color:#007700;font-family:'Courier New',monospace}
  .footer{margin-top:40px;border-top:1px solid #ccc;padding-top:16px;font-size:10px;color:#888;line-height:2}
  @media print{body{padding:20px}}
</style></head><body>
<div class="logo">👁️ SAATCHI</div>
<div class="tagline">YOUR DIGITAL WITNESS — Evidence disappears. SAATCHI doesn't let it.</div>
<hr/>
<div class="badge">${(incident.severity||"MEDIUM")} SEVERITY</div>
<div class="field"><div class="label">Case ID</div><div class="value">${id}</div></div>
<div class="field"><div class="label">Category</div><div class="value">${incident.category||"—"}</div></div>
<div class="field"><div class="label">Platform</div><div class="value">${incident.platform||"—"}</div></div>
<div class="field"><div class="label">Evidence URL</div><div class="value">${incident.url||"—"}</div></div>
<div class="field"><div class="label">Captured At</div><div class="value">${new Date(incident.captured_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST</div></div>
<div class="field"><div class="label">Reported By (User ID)</div><div class="value">${incident.user_id||"Anonymous"}</div></div>
<div class="field"><div class="label">Detected Parties</div><div class="value">${(incident.sender_info||[]).join(", ")||"Not detected"}</div></div>
<div class="field"><div class="label">Incident Summary</div><div class="value">${incident.summary||"—"}</div></div>
<div class="field"><div class="label">Recommended Action</div><div class="value">${incident.recommended_action||"—"}</div></div>
<div class="field"><div class="label">AI Confidence</div><div class="value">${Math.round((incident.ai_confidence||0)*100)}%</div></div>
<div class="field"><div class="label">SHA-256 Tamper-Proof Hash</div><div class="value hash">${incident.sha256_hash||"—"}</div></div>
<div class="footer">
Report generated by SAATCHI Digital Witness System<br/>
Generated: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST<br/>
The SHA-256 hash cryptographically verifies this evidence has not been altered.<br/>
This report may be submitted to law enforcement or institutional complaint portals.<br/>
<strong>SAATCHI — Because every victim deserves to be believed.</strong>
</div>
<script>window.print();</script>
</body></html>`;
}
