import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Allyouneed",
    short_name: "Allyouneed",
    description: "Everything your business runs on. One OS.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#534AB7",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
