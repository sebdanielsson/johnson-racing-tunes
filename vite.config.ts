import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
