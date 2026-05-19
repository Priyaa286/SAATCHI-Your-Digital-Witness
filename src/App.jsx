import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setChecking(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0c10", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "40px" }}>👁️</div>
        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#00e5ff", letterSpacing: "2px" }}>LOADING VAULT...</div>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={setUser} />;

  return <Dashboard user={user} onSignOut={() => setUser(null)} />;
}
