import { useState, useEffect } from "react";
import { fetchUserIncidents, deleteIncident, signOut, caseId, timeAgo, generateReportHTML } from "../lib/supabase";
import AddIncidentModal from "./AddIncidentModal";

const C = {
  bg: "#0a0c10", surface: "#111318", border: "#1e2330",
  accent: "#00e5ff", purple: "#7c3aed", text: "#e8eaf6",
  muted: "#6b7280", success: "#00d68f", danger: "#ff4757"
};

const SEV = {
  CRITICAL: { color: "#ff4757", bg: "rgba(255,71,87,0.12)", dot: "#ff4757" },
  HIGH:     { color: "#ff6b35", bg: "rgba(255,107,53,0.12)", dot: "#ff6b35" },
  MEDIUM:   { color: "#ffa502", bg: "rgba(255,165,2,0.12)",  dot: "#ffa502" },
  LOW:      { color: "#00d68f", bg: "rgba(0,214,143,0.12)",  dot: "#00d68f" },
};

function SevBadge({ severity }) {
  const s = SEV[severity] || SEV.MEDIUM;
  return <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", fontFamily: "monospace", letterSpacing: "1px", color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}>{severity}</span>;
}

// ── INCIDENT DETAIL PANEL ──────────────────────────────────────────────────
function DetailPanel({ incident, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const exportReport = () => {
    const win = window.open("", "_blank");
    win.document.write(generateReportHTML(incident));
    win.document.close();
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteIncident(incident.id);
      onDelete(incident.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: "480px", background: C.surface, borderRadius: "20px 20px 0 0", border: `1px solid ${C.border}`, maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.2s ease" }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle + close */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", background: C.border, borderRadius: "2px" }} />
        </div>

        <div style={{ padding: "16px 20px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ flex: 1, paddingRight: "12px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                <SevBadge severity={incident.severity} />
                <span style={{ fontSize: "10px", color: C.muted, fontFamily: "monospace" }}>{incident.category}</span>
              </div>
              <h2 style={{ color: C.text, fontSize: "15px", fontWeight: "700", lineHeight: "1.3", margin: 0 }}>{incident.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: "20px", cursor: "pointer", padding: "0", flexShrink: 0 }}>✕</button>
          </div>

          {/* Case ID */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "10px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>Case ID</div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: C.accent }}>{caseId(incident)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>Captured</div>
              <div style={{ fontSize: "12px", color: C.text }}>{timeAgo(incident.captured_at)}</div>
            </div>
          </div>

          {/* Grid: platform + confidence */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            {[["Platform", incident.platform], ["AI Confidence", `${Math.round((incident.ai_confidence||0)*100)}%`]].map(([l, v]) => (
              <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "10px 12px" }}>
                <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{l}</div>
                <div style={{ fontSize: "13px", color: C.text, fontWeight: "600" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Evidence URL</div>
            <div style={{ fontSize: "11px", color: "#60a5fa", wordBreak: "break-all", fontFamily: "monospace" }}>{incident.url}</div>
          </div>

          {/* Senders */}
          {incident.sender_info?.length > 0 && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
              <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Detected Parties</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {incident.sender_info.map((s, i) => (
                  <span key={i} style={{ padding: "3px 9px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "20px", fontSize: "11px", color: "#a78bfa", fontFamily: "monospace" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div style={{ background: C.bg, border: `1px solid ${(SEV[incident.severity]||SEV.MEDIUM).color}30`, borderLeft: `3px solid ${(SEV[incident.severity]||SEV.MEDIUM).color}`, borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>AI Summary</div>
            <p style={{ fontSize: "12px", color: "#d1d5db", lineHeight: "1.6", margin: "0 0 10px" }}>{incident.summary}</p>
            <div style={{ padding: "8px", background: "rgba(0,229,255,0.05)", borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>→ {incident.recommended_action}</span>
            </div>
          </div>

          {/* SHA-256 */}
          <div style={{ background: "#0d1117", border: `1px solid ${C.success}33`, borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
            <div style={{ fontSize: "9px", color: C.success, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>🔒 SHA-256 Tamper-Proof Hash</div>
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#4ade80", wordBreak: "break-all", lineHeight: "1.8" }}>{incident.sha256_hash}</div>
          </div>

          {/* Actions */}
          <button onClick={exportReport} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", borderRadius: "12px", color: "white", fontFamily: "monospace", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer", marginBottom: "10px" }}>
            📄 EXPORT LEGAL REPORT (PDF)
          </button>

          <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: "11px", background: confirmDelete ? "rgba(255,71,87,0.15)" : "transparent", border: `1px solid ${confirmDelete ? C.danger : C.border}`, borderRadius: "12px", color: confirmDelete ? C.danger : C.muted, fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
            {deleting ? "Deleting..." : confirmDelete ? "⚠️ Confirm Delete" : "🗑 Delete Incident"}
          </button>
          {confirmDelete && <p style={{ textAlign: "center", fontSize: "10px", color: C.muted, marginTop: "6px" }}>This cannot be undone. Click again to confirm.</p>}
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard({ user, onSignOut }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setSevFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("vault"); // vault | about

  useEffect(() => {
    fetchUserIncidents(user.id)
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleAdded = (record) => {
    setIncidents(prev => [record, ...prev]);
  };

  const handleDeleted = (id) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  const filtered = incidents.filter(i => {
    const matchSev = filter === "ALL" || i.severity === filter;
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.platform?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === "CRITICAL").length,
    high: incidents.filter(i => i.severity === "HIGH").length,
  };

  const NAV = [{ id: "vault", icon: "🗄️", label: "Vault" }, { id: "about", icon: "👁️", label: "About" }];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", maxWidth: "480px", margin: "0 auto" }}>

      {/* Top bar */}
      <div style={{ background: "#0d1117", borderBottom: `1px solid ${C.border}`, padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>👁️</div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: C.accent, letterSpacing: "2px" }}>SAATCHI</div>
            <div style={{ fontSize: "9px", color: C.muted, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.muted, fontSize: "11px", padding: "5px 10px", cursor: "pointer" }}>
          Sign out
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "80px" }}>

        {tab === "vault" && (
          <>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${C.border}` }}>
              {[["Total", stats.total, C.text], ["Critical", stats.critical, "#ff4757"], ["High", stats.high, "#ff6b35"]].map(([l, v, col]) => (
                <div key={l} style={{ flex: 1, padding: "14px", textAlign: "center", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: col, fontFamily: "monospace" }}>{v}</div>
                  <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div style={{ padding: "14px 18px 0" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..." style={{ width: "100%", padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(f => (
                  <button key={f} onClick={() => setSevFilter(f)} style={{ padding: "5px 12px", fontSize: "9px", fontFamily: "monospace", fontWeight: "700", letterSpacing: "1px", whiteSpace: "nowrap", border: filter === f ? `1px solid ${(SEV[f]||{color:C.accent}).color}` : `1px solid ${C.border}`, borderRadius: "20px", cursor: "pointer", flexShrink: 0, background: filter === f ? (SEV[f]||{bg:`rgba(0,229,255,0.1)`}).bg : "transparent", color: filter === f ? (SEV[f]||{color:C.accent}).color : C.muted }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ marginTop: "10px" }}>
              {loading ? (
                <div style={{ padding: "50px", textAlign: "center", color: C.muted, fontSize: "13px" }}>Loading vault...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗄️</div>
                  <p style={{ color: C.muted, fontSize: "13px", marginBottom: "20px" }}>{search || filter !== "ALL" ? "No matching incidents" : "Your vault is empty"}</p>
                  {!search && filter === "ALL" && (
                    <button onClick={() => setShowAdd(true)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", borderRadius: "12px", color: "white", fontFamily: "monospace", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer" }}>
                      + ADD FIRST INCIDENT
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(inc => {
                  const s = SEV[inc.severity] || SEV.MEDIUM;
                  return (
                    <div key={inc.id} onClick={() => setSelected(inc)} style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.dot, flexShrink: 0, marginTop: "5px" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: "8px" }}>{inc.title}</span>
                          <span style={{ fontSize: "10px", color: C.muted, flexShrink: 0 }}>{timeAgo(inc.captured_at)}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: s.color, fontFamily: "monospace", fontWeight: "700" }}>{inc.severity}</span>
                          <span style={{ fontSize: "10px", color: C.muted }}>·</span>
                          <span style={{ fontSize: "10px", color: C.muted }}>{inc.platform}</span>
                          <span style={{ fontSize: "10px", color: C.muted }}>·</span>
                          <span style={{ fontSize: "10px", color: C.muted }}>{inc.category}</span>
                        </div>
                      </div>
                      <span style={{ color: C.muted, fontSize: "14px", flexShrink: 0 }}>›</span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {tab === "about" && (
          <div style={{ padding: "24px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>👁️</div>
              <h1 style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: "900", color: C.accent, letterSpacing: "3px", margin: "0 0 6px" }}>SAATCHI</h1>
              <p style={{ color: C.muted, fontSize: "13px", fontStyle: "italic", margin: 0 }}>"Evidence disappears. SAATCHI doesn't let it."</p>
            </div>
            {[
              { icon: "⚡", t: "One-Click Capture", d: "Add any harassment URL instantly — desktop or mobile" },
              { icon: "🔐", t: "SHA-256 Hashing", d: "Every incident is cryptographically fingerprinted locally" },
              { icon: "🗄️", t: "Private Encrypted Vault", d: "Your evidence is yours alone — Row Level Security enforced" },
              { icon: "📄", t: "Legal PDF Export", d: "Court-ready reports for law enforcement or institutions" },
              { icon: "🤖", t: "AI Classification", d: "Claude auto-detects severity, category & next steps" },
              { icon: "📱", t: "Mobile PWA", d: "Install on your phone — works like a native app" },
            ].map(f => (
              <div key={f.t} style={{ display: "flex", gap: "14px", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "22px", width: "30px", textAlign: "center", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: C.text, marginBottom: "3px" }}>{f.t}</div>
                  <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.5" }}>{f.d}</div>
                </div>
              </div>
            ))}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px", marginTop: "20px" }}>
              <div style={{ fontSize: "13px", color: C.text, fontWeight: "600" }}>Commit Happens Hackathon 2025</div>
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>ACM × DevSource · Team: Creative Compilers</div>
            </div>
            <p style={{ textAlign: "center", fontSize: "12px", color: C.muted, fontStyle: "italic", marginTop: "20px" }}>Because every victim deserves to be believed.</p>
          </div>
        )}
      </div>

      {/* FAB — Add Incident */}
      {tab === "vault" && (
        <button onClick={() => setShowAdd(true)} style={{ position: "fixed", bottom: "76px", right: "calc(50% - 228px)", width: "52px", height: "52px", borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", color: "white", fontSize: "24px", cursor: "pointer", boxShadow: "0 4px 24px rgba(124,58,237,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          +
        </button>
      )}

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", background: "#0d1117", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <span style={{ fontSize: "18px", opacity: tab === n.id ? 1 : 0.4 }}>{n.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: "600", color: tab === n.id ? C.accent : C.muted, letterSpacing: "0.5px" }}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {showAdd && <AddIncidentModal user={user} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      {selected && <DetailPanel incident={selected} onClose={() => setSelected(null)} onDelete={handleDeleted} />}
    </div>
  );
}
