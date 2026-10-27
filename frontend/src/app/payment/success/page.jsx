"use client";

import { Suspense } from "react";
import PaymentSuccess from "@/views/PaymentSuccess";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
}
