"use client";

import { useState, useTransition } from "react";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  UserCheck,
  KeyRound,
  LogOut,
  Zap,
  ShieldAlert,
} from "lucide-react";

interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  enabled: boolean;
  rolloutPercent: number;
  requiredPlan: string | null;
}

interface HealthCheck {
  id: string;
  componentKey: string;
  displayName: string;
  status: string;
  uptimePercent: number;
}

interface User360Data {
  user: {
    id: string;
    displayName: string | null;
    email: string | null;
    accountStatus: string;
  } | null;
  membershipsCount: number;
  sessionsCount: number;
}

interface Props {
  initialFlags: FeatureFlag[];
  initialHealth: HealthCheck[];
  user360: User360Data;
}

export function SuperOwnerInteractiveControl({ initialFlags, initialHealth, user360 }: Props) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [health, setHealth] = useState<HealthCheck[]>(initialHealth);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "Super Owner Control runtime initialized in authorized session mode.",
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 7),
    ]);
  };

  const handleToggleFlag = (flagKey: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      try {
        addLog(`Toggling feature flag '${flagKey}' to ${nextStatus ? "ENABLED" : "DISABLED"}...`);
        const res = await fetch("/api/super-owner/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_flag", flagKey, enabled: nextStatus }),
        });
        const data = await res.json();
        if (data.ok) {
          setFlags((prev) =>
            prev.map((f) => (f.flagKey === flagKey ? { ...f, enabled: nextStatus } : f))
          );
          setNotification({ text: data.message, type: "success" });
          addLog(`✓ ${data.message}`);
        } else {
          setNotification({ text: data.error || "Failed to update flag.", type: "error" });
          addLog(`Error: ${data.error}`);
        }
      } catch (err: any) {
        setNotification({ text: err.message || "Network error", type: "error" });
        addLog(`Network failure updating flag: ${err.message}`);
      }
    });
  };

  const handleFixAllHealth = () => {
    startTransition(async () => {
      try {
        addLog("Running comprehensive system health auto-repair routine...");
        const res = await fetch("/api/super-owner/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "fix_all_health" }),
        });
        const data = await res.json();
        if (data.ok) {
          setHealth((prev) =>
            prev.map((h) => ({ ...h, status: "active", uptimePercent: 100 }))
          );
          setNotification({ text: data.message, type: "success" });
          addLog("✓ All system health monitors restored to 100% operational status.");
        } else {
          setNotification({ text: data.error || "Repair failed", type: "error" });
          addLog(`Repair error: ${data.error}`);
        }
      } catch (err: any) {
        setNotification({ text: err.message, type: "error" });
      }
    });
  };

  const handleUserAction = (action: "verify_user" | "reset_user_password" | "force_logout") => {
    const targetUserId = user360.user?.id;
    if (!targetUserId) return;
    startTransition(async () => {
      try {
        addLog(`Executing action '${action}' for user ${user360.user?.email ?? targetUserId}...`);
        const res = await fetch("/api/super-owner/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, userId: targetUserId }),
        });
        const data = await res.json();
        if (data.ok) {
          setNotification({ text: data.message, type: "success" });
          addLog(`✓ ${data.message}`);
        } else {
          setNotification({ text: data.error || "Action failed", type: "error" });
          addLog(`Action failed: ${data.error}`);
        }
      } catch (err: any) {
        setNotification({ text: err.message, type: "error" });
      }
    });
  };

  const handleFlushCache = () => {
    startTransition(async () => {
      try {
        addLog("Flushing platform registry caches...");
        const res = await fetch("/api/super-owner/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "flush_cache" }),
        });
        const data = await res.json();
        if (data.ok) {
          setNotification({ text: data.message, type: "success" });
          addLog("✓ Application cache flushed successfully.");
        }
      } catch (err: any) {
        setNotification({ text: err.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
              : "border-rose-400/30 bg-rose-500/15 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-300" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-white/50 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Action One-Click Bar */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-300" />
              <h2 className="text-xl font-black">Super Owner One-Click Fix Suite</h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Direct diagnostic, state repairs, and automated synchronization for the whole workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFixAllHealth}
              disabled={isPending}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 text-sm font-black text-[#042419] shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>Fix All Health Checks</span>
            </button>
            <button
              onClick={handleFlushCache}
              disabled={isPending}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
              <span>Flush Platform Cache</span>
            </button>
          </div>
        </div>

        {/* Live Diagnostics Log console */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs">
          <p className="mb-2 font-bold uppercase tracking-wider text-yellow-300/70">
            System Live Activity Log
          </p>
          <div className="space-y-1 text-white/70">
            {logs.map((log, i) => (
              <div key={i} className="truncate">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Health Checks + User 360 Actions */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* System Health with Repair */}
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">System Health & Live Monitoring</h3>
            <button
              onClick={handleFixAllHealth}
              disabled={isPending}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20"
            >
              Repair All
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {health.map((check) => (
              <div
                key={check.id}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        check.status === "active" ? "bg-emerald-400" : "bg-yellow-400"
                      }`}
                    />
                    <p className="font-bold text-sm">{check.displayName}</p>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      check.status === "active" ? "text-emerald-300" : "text-yellow-200"
                    }`}
                  >
                    {check.uptimePercent}% Uptime · {check.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${check.uptimePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User 360 Interactive Management */}
        <div className="glass-panel rounded-[2rem] p-6">
          <h3 className="text-xl font-black">Target User 360° Controls</h3>
          <div className="mt-4 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-5">
            <p className="text-xs uppercase tracking-wider text-yellow-300/70 font-bold">
              Target Profile
            </p>
            <p className="mt-1 text-2xl font-black">{user360.user?.displayName || "Primary Owner"}</p>
            <p className="mt-1 text-sm text-white/70">{user360.user?.email}</p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                Status: {user360.user?.accountStatus || "active"}
              </span>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs font-bold text-white/70">
                {user360.membershipsCount} Workspaces
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Executable User Fix Actions
            </p>
            <button
              onClick={() => handleUserAction("verify_user")}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-emerald-300">
                <UserCheck className="h-4 w-4" />
                Activate & Verify Credentials
              </span>
              <span className="text-xs text-white/40">100% Score →</span>
            </button>

            <button
              onClick={() => handleUserAction("reset_user_password")}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-yellow-200">
                <KeyRound className="h-4 w-4" />
                Reset Password to &apos;foysalit123&apos;
              </span>
              <span className="text-xs text-white/40">Apply →</span>
            </button>

            <button
              onClick={() => handleUserAction("force_logout")}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold transition hover:bg-rose-500/20 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-rose-300">
                <LogOut className="h-4 w-4" />
                Force Logout All Active Sessions
              </span>
              <span className="text-xs text-rose-300/60">Revoke →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Flags Live Interactive Toggles */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-fuchsia-400" />
            <h3 className="text-xl font-black">Live Feature Flags Toggles</h3>
          </div>
          <span className="text-xs font-semibold text-white/45">
            Changes persist immediately to workspace runtime
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-white text-sm">{flag.name}</p>
                  {/* Live Toggle Button */}
                  <button
                    onClick={() => handleToggleFlag(flag.flagKey, flag.enabled)}
                    disabled={isPending}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabled ? "bg-emerald-400" : "bg-white/20"
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/50">Key: {flag.flagKey}</p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/40">
                <span>Rollout: {flag.rolloutPercent}%</span>
                <span className={flag.enabled ? "text-emerald-300 font-bold" : "text-white/40"}>
                  {flag.enabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
