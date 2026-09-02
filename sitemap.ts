import type { MetadataRoute } from "next";

const publicRoutes = [
  "",
  "/about",
  "/features",
  "/solutions",
  "/ai",
  "/agency-os",
  "/business-os",
  "/integrations",
  "/pricing",
  "/enterprise",
  "/security",
  "/documentation",
  "/faq",
  "/contact",
  "/free-trial",
  "/lead-intelligence",
  "/jarvis",
  "/ai-workforce",
  "/app-center",
  "/final-check",
  "/test-center",
  "/subscription-launch",
  "/platform-audit",
  "/professional-review",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL || process.env.PUBLIC_URL || "https://foysalit.com").replace(/\/$/, "");
  return publicRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
