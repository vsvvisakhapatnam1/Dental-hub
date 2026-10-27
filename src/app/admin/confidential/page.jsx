"use client";

import AdminConfidential from "@/views/AdminConfidential";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminConfidentialPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminConfidential />
    </ProtectedRoute>
  );
}
