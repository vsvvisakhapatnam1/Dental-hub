"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminLogin from "@/views/AdminLogin";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (adminOnly) {
    if (!user || user.role !== "admin") {
      return <AdminLogin />;
    }
  } else if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
