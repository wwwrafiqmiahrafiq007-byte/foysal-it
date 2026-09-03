import Image from "next/image";
import Link from "next/link";
import { getAIWorkforceSnapshot } from "@/lib/ai-workforce";
import { AIWorkforceClient } from "./AIWorkforceClient";

export const dynamic = "force-dynamic";

export default async function AIWorkforcePage() {
  const snapshot = await getAIWorkforceSnapshot();

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div>
              <p className="font-black tracking-[0.18em]">FOYSAL IT · AI WORKFORCE</p>
              <p className="text-sm text-white/50">200+ AI Employees · Humans · Approval · n8n</p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/jarvis" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Jarvis</Link>
            <Link href="/lead-intelligence" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Lead Intelligence</Link>
            <a href="/api/workforce/overview" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022]">Workforce API</a>
          </div>
        </nav>
        <AIWorkforceClient initial={snapshot} />
      </div>
    </main>
  );
}
