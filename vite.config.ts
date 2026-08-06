import { execSync } from "node:child_process";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Commit SHA for the footer: Vercel exposes it at build time; fall back to the
// local git HEAD for dev/local builds.
function commitSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "";
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __COMMIT_SHA__: JSON.stringify(commitSha()),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The app registers the worker itself (see hooks/use-app-update.ts) so it
      // can decide when to check for a new build and when to swap it in.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Johnson Racing Tunes",
        short_name: "JRT Tunes",
        description:
          "Every Forza tune share code from Johnson Racing Tunes — searchable, filterable, one tap to copy.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0a0a0b",
        background_color: "#0a0a0b",
        categories: ["games", "utilities"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the whole app so it works offline the moment it's installed.
        // The tune dataset is baked into the JS bundle, so all data is available
        // offline too.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // The OG image is only fetched by link-preview crawlers, never the app.
        globIgnores: ["**/og-image.png"],
        navigateFallback: "/index.html",
        // The Google Sheets CSV proxy must always hit the network, never the
        // SPA shell.
        navigateFallbackDenylist: [/^\/sheets\//],
        cleanupOutdatedCaches: true,
        // A new worker waits until the app applies it, then claims the page —
        // which reloads it onto the new build.
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Keep the most recent live refresh available offline.
            urlPattern: ({ url }) => url.pathname.startsWith("/sheets/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "sheets-csv",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // Same-origin proxy to Google Sheets in dev (bypasses CORS). Scoped to the
    // single spreadsheet the app reads, mirroring the vercel.json rewrite.
    proxy: {
      "/sheets/spreadsheets/d/1F3xqy6yodUmnuua08YU-fet4KDDoIbaoNZRiZ9U8yxk": {
        target: "https://docs.google.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/sheets/, ""),
      },
    },
  },
});
