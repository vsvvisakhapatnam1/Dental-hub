import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center" data-testid="payment-cancel">
        <XCircle className="h-14 w-14 text-slate-400 mx-auto" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Payment cancelled</h1>
        <p className="mt-1 text-slate-500">No charge was made. You can pick a plan whenever you're ready.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/pricing"><Button className="rounded-full bg-emerald-800 hover:bg-emerald-900">Back to Plans</Button></Link>
          <Link to="/"><Button variant="outline" className="rounded-full">Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
