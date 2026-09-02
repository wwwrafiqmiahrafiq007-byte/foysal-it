import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FOYSAL IT OS",
    short_name: "FOYSAL IT",
    description: "AI-powered lead intelligence, Jarvis core, AI workforce and business operating system.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#100012",
    theme_color: "#250022",
    orientation: "any",
    categories: ["business", "productivity", "marketing", "utilities"],
    icons: [
      {
        src: "/foysal-it-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
