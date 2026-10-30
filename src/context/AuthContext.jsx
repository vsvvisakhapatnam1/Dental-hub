"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = loading, false = anon, object = user
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Safety failsafe: ensure loading never hangs past 2.5s on mobile networks
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    try {
      const { data } = await api.get("/auth/me");
      setUser(data || false);
      return data || false;
    } catch {
      setUser(false);
      return false;
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.session_token) setToken(data.session_token);
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.session_token) setToken(data.session_token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setToken(null);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
