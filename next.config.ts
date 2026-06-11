import type { NextConfig } from "next";

// STATIC_EXPORT=1 (used by scripts/build-static.mjs) produces the `out/`
// folder for plain static hosting — a frozen snapshot without the API/scraper.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Playwright must stay a runtime require — bundling it breaks browser launch.
  serverExternalPackages: ["playwright"],
  ...(isStaticExport
    ? {
        output: "export" as const,
        // index.html-per-folder so deep links work on any web server
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
