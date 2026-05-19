import { useState } from "react";
import { signIn, signUp } from "../lib/supabase";

const C = {
  bg: "#0a0c10", surface: "#111318", border: "#1e2330",
  accent: "#00e5ff", purple: "#7c3aed", text: "#e8eaf6",
  muted: "#6b7280", success: "#00d68f", danger: "#ff4757"
};

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handle = async () => {
    if (!email || !password) { setError("Email and password are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setInfo(""); setLoading(true);

    try {
      if (mode === "login") {
        const { data, error: e } = await signIn(email, password);
        if (e) throw e;
        onAuth(data.user);
      } else {
        const { data, error: e } = await signUp(email, password);
        if (e) throw e;
        if (data.user && !data.session) {
          setInfo("Check your email to confirm your account, then log in.");
          setMode("login");
        } else if (data.user) {
          onAuth(data.user);
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>👁️</div>
          <h1 style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: "900", color: C.accent, letterSpacing: "4px", margin: "0 0 6px" }}>SAATCHI</h1>
          <p style={{ color: C.muted, fontSize: "13px", margin: 0 }}>Your Digital Witness</p>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "28px" }}>
          <h2 style={{ color: C.text, fontSize: "16px", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
            {mode === "login" ? "Sign in to your vault" : "Create your vault"}
          </h2>

          {/* Tab switch */}
          <div style={{ display: "flex", background: C.bg, borderRadius: "10px", padding: "4px", marginBottom: "20px" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); }} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700", fontFamily: "monospace", letterSpacing: "1px", transition: "all 0.15s", background: mode === m ? C.purple : "transparent", color: mode === m ? "white" : C.muted }}>
                {m === "login" ? "LOG IN" : "SIGN UP"}
              </button>
            ))}
          </div>

          {/* Fields */}
          {[
            { label: "Email", value: email, onChange: setEmail, type: "email", placeholder: "you@example.com" },
            { label: "Password", value: password, onChange: setPassword, type: "password", placeholder: "••••••••" }
          ].map(f => (
            <div key={f.label} style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                onKeyDown={e => e.key === "Enter" && handle()}
                disabled={loading}
                style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          {/* Error / Info */}
          {error && <div style={{ background: "rgba(255,71,87,0.1)", border: `1px solid ${C.danger}40`, borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", color: C.danger }}>⚠️ {error}</div>}
          {info && <div style={{ background: "rgba(0,214,143,0.08)", border: `1px solid ${C.success}40`, borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", color: C.success }}>✅ {info}</div>}

          {/* Submit */}
          <button onClick={handle} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#374151" : `linear-gradient(135deg, ${C.purple}, #6d28d9)`, border: "none", borderRadius: "12px", color: "white", fontFamily: "monospace", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: "4px" }}>
            {loading ? "..." : mode === "login" ? "ENTER VAULT" : "CREATE VAULT"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: C.muted, marginTop: "20px", lineHeight: "1.6" }}>
          🔒 Your evidence vault is private.<br />Only you can access your incidents.
        </p>
      </div>
    </div>
  );
}
