import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaRegister } from "./PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : undefined,
  title: "FOYSAL IT — AI Lead Intelligence & Business Operating System",
  description:
    "FOYSAL IT OS combines AI-powered lead intelligence, website audits, Jarvis Core, AI workforce, n8n automation, outreach approval, sales pipeline, monitoring, billing and integrations.",
  applicationName: "FOYSAL IT OS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/foysal-it-mark.svg",
    apple: "/foysal-it-mark.svg",
  },
  openGraph: {
    title: "FOYSAL IT — Turn Every Lead Into An Opportunity",
    description: "AI-powered lead intelligence, digital audit, outreach automation and AI-human workforce OS.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#250022",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#100012] text-white antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
