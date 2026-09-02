import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_URL || process.env.PUBLIC_URL || "https://foysalit.com").replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/super-owner"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
