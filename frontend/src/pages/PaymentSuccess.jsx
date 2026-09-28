import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_POLLS = 8;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState("checking"); // checking | paid | pending | error | expired
  const [info, setInfo] = useState(null);
  const polls = useRef(0);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    let timer;
    const poll = async () => {
      try {
        const r = await api.get(`/payments/status/${sessionId}`);
        setInfo(r.data);
        if (r.data.payment_status === "paid") { setState("paid"); return; }
        if (["expired", "failed"].includes(r.data.payment_status)) { setState("expired"); return; }
        if (polls.current >= MAX_POLLS) { setState("pending"); return; }
        polls.current += 1;
        timer = setTimeout(poll, 2000);
      } catch (e) {
        setState("error");
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center" data-testid="payment-result">
        {state === "checking" && (<><Loader2 className="h-12 w-12 text-emerald-700 animate-spin mx-auto" /><h1 className="mt-4 font-heading text-2xl font-bold">Confirming your payment…</h1><p className="mt-1 text-slate-500">Please wait a moment.</p></>)}
        {state === "paid" && (<><CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" /><h1 className="mt-4 font-heading text-2xl font-bold">Payment successful 🎉</h1><p className="mt-1 text-slate-500">{info?.package_name} · ${info?.amount?.toFixed?.(2)} {info?.currency?.toUpperCase()}</p><p className="mt-2 text-sm text-slate-500">Thank you! Your purchase is confirmed.</p></>)}
        {state === "pending" && (<><Clock className="h-14 w-14 text-amber-500 mx-auto" /><h1 className="mt-4 font-heading text-2xl font-bold">Payment processing</h1><p className="mt-1 text-slate-500">This is taking longer than usual. We'll update your account once confirmed.</p></>)}
        {state === "expired" && (<><XCircle className="h-14 w-14 text-red-500 mx-auto" /><h1 className="mt-4 font-heading text-2xl font-bold">Payment not completed</h1><p className="mt-1 text-slate-500">The session expired or failed. Please try again.</p></>)}
        {state === "error" && (<><XCircle className="h-14 w-14 text-red-500 mx-auto" /><h1 className="mt-4 font-heading text-2xl font-bold">Something went wrong</h1><p className="mt-1 text-slate-500">We couldn't verify this payment.</p></>)}
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/pricing"><Button variant="outline" className="rounded-full">Back to Plans</Button></Link>
          <Link to="/dashboard"><Button className="rounded-full bg-emerald-800 hover:bg-emerald-900">Go to Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
