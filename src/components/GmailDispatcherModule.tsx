"use client";

import { useState } from "react";
import { Mail, Send, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface GmailDispatcherProps {
  defaultRecipient?: string;
  workspaceName?: string;
}

export function GmailDispatcherModule({
  defaultRecipient = "rafiqmiahrafiq007@gmail.com",
  workspaceName = "FOYSAL IT OS",
}: GmailDispatcherProps) {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(`[${workspaceName}] Executive Business Verification Notice`);
  const [body, setBody] = useState(
    `Hello,\n\nThis is a verified test dispatch from FOYSAL IT OS.\n\nStatus: 100% Operational\nWorkspace: ${workspaceName}\nTimestamp: ${new Date().toLocaleString()}`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message?: string;
    gmailComposeUrl?: string;
    deliveryProvider?: string;
  } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: recipient.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({
          ok: true,
          message: data.message || "Email queued and staged for delivery.",
          gmailComposeUrl: data.gmailComposeUrl,
          deliveryProvider: data.deliveryProvider,
        });
      } else {
        setResult({
          ok: false,
          message: data.error || "Failed to dispatch email.",
        });
      }
    } catch {
      // Fallback direct Gmail compose
      const directUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        recipient
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setResult({
        ok: true,
        message: "Email staged successfully. Ready to send via Gmail compose.",
        gmailComposeUrl: directUrl,
        deliveryProvider: "Gmail Web Direct",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (type: "proposal" | "task" | "welcome") => {
    if (type === "proposal") {
      setSubject(`Service Proposal: Digital Marketing & SEO Optimization — ${workspaceName}`);
      setBody(
        `Dear Partner,\n\nThank you for connecting with ${workspaceName}. Attached is our customized project scope covering Technical SEO, UI/UX refinement, and Lead Generation.\n\nPlease review and let us know your feedback.\n\nBest regards,\n${workspaceName} Team`
      );
    } else if (type === "task") {
      setSubject(`[Task Update] Completed: System Quality & Route Audit`);
      setBody(
        `Hi Team,\n\nThe system verification checklist and task executions have been completed successfully with 100% operational pass rate.\n\nRegards,\nOperations`
      );
    } else {
      setSubject(`Welcome to ${workspaceName} Unified Workspace`);
      setBody(
        `Hello,\n\nWelcome to your dedicated enterprise workspace. Your account has been provisioned and all system modules are ready for operation.\n\nLet us know if you need assistance.\n\nSincerely,\nSuper Owner`
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gmail & Communications Hub</h3>
            <p className="text-xs text-slate-400">Live test dispatch & 1-Click Gmail composer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Relay Active
          </span>
        </div>
      </div>

      {/* Quick template buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset("proposal")}
          className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Agency Proposal
        </button>
        <button
          type="button"
          onClick={() => applyPreset("task")}
          className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Task Notice
        </button>
        <button
          type="button"
          onClick={() => applyPreset("welcome")}
          className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Welcome Email
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To Email (Recipient)</label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. client@gmail.com"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Message Body</label>
          <textarea
            rows={3}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Dispatches via configured SMTP/Resend or triggers direct 1-Click Gmail Web Compose.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>{loading ? "Sending..." : "Send / Dispatch Email"}</span>
          </button>
        </div>
      </form>

      {/* Result box */}
      {result && (
        <div
          className={`mt-4 rounded-xl border p-3.5 ${
            result.ok
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
              : "border-rose-500/30 bg-rose-950/20 text-rose-300"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {result.ok ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-semibold">{result.message}</p>
              {result.deliveryProvider && (
                <p className="mt-0.5 text-[11px] opacity-80">Provider: {result.deliveryProvider}</p>
              )}

              {result.gmailComposeUrl && (
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={result.gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white transition"
                  >
                    <span>Open in Gmail Compose</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-[11px] opacity-80">(Direct inbox composer with prefilled draft)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
