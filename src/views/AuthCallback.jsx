"use client";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    const run = async () => {
      try {
        const { data } = await api.post("/auth/google/session", {}, { headers: { "X-Session-ID": sessionId } });
        if (data.session_token) setToken(data.session_token);
        setUser(data);
        window.history.replaceState({}, document.title, "/dashboard");
        navigate(data.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };
    if (sessionId) run(); else navigate("/login", { replace: true });
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700 mx-auto" />
        <p className="mt-3 text-slate-500">Signing you in…</p>
      </div>
    </div>
  );
}
