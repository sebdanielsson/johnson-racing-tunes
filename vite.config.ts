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
    // Same-origin proxy to Google Sheets in dev (bypasses CORS). In production
    // the equivalent rewrite lives in vercel.json.
    proxy: {
      "/sheets": {
        target: "https://docs.google.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/sheets/, ""),
      },
    },
  },
});
