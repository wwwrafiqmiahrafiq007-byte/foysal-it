"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPwaButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("Install option appears when your browser supports PWA install.");

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setMessage("Install is ready for this browser/device.");
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setMessage("FOYSAL IT OS installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) {
      setMessage("Install prompt is not available yet. On iOS use Safari → Share → Add to Home Screen. On desktop use browser menu → Install app.");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setMessage(choice.outcome === "accepted" ? "Install accepted. Opening as app will be available from your device." : "Install dismissed. You can try again from the browser install menu.");
    setInstallPrompt(null);
  }

  return (
    <div className={compact ? "space-y-2" : "rounded-3xl border border-yellow-200/25 bg-yellow-200/10 p-5"}>
      <button
        type="button"
        onClick={install}
        disabled={installed}
        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#250022] shadow-2xl shadow-fuchsia-950/20 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {installed ? "Installed ✓" : "Install FOYSAL IT OS App"}
      </button>
      <p className="text-xs leading-5 text-white/60">{message}</p>
    </div>
  );
}
