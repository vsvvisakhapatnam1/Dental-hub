import { useRef, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud, FileCheck2, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";

export function CvUpload({ value, filename, onChange, required }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(res.data.url, res.data.filename);
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error("Upload failed. Try a PDF, DOC or image under 10MB.");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => { onChange("", ""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div>
      <Label className="mb-1.5 block">Resume / CV{required && <span className="text-red-500"> *</span>}</Label>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={handle} className="hidden" data-testid="reg-cv-input" />
      {value ? (
        <div data-testid="reg-cv-uploaded" className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
          <FileCheck2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200 truncate flex-1">{filename || "Resume uploaded"}</span>
          <button type="button" data-testid="reg-cv-remove" onClick={clear} className="rounded-full p-1 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <button type="button" data-testid="reg-cv-btn" onClick={() => inputRef.current?.click()} disabled={busy}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-slate-500 hover:border-emerald-500 hover:text-emerald-700 transition-colors">
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
          <span className="text-sm font-medium">{busy ? "Uploading…" : "Upload Resume / CV"}</span>
          <span className="text-xs text-slate-400">PDF, DOC, DOCX or image · max 10MB</span>
        </button>
      )}
    </div>
  );
}
