"use client";

import PostOpportunity from "@/views/PostOpportunity";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function PostPage() {
  return (
    <ProtectedRoute>
      <PostOpportunity />
    </ProtectedRoute>
  );
}
