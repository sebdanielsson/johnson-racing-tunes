/** Maps a game to its categorical chart slot, so badges and charts agree. */
export const gameColorVar: Record<string, string> = {
  "Forza Horizon 6": "var(--chart-1)",
  "Forza Horizon 5": "var(--chart-2)",
  "Forza Horizon 4": "var(--chart-3)",
  "Forza Horizon 3": "var(--chart-4)",
  "Forza Motorsport 7": "var(--chart-5)",
};

export const CHANNEL_URL = "https://www.youtube.com/channel/UCGK33hhvffYv5hUNqB0wVnQ";
export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1F3xqy6yodUmnuua08YU-fet4KDDoIbaoNZRiZ9U8yxk/htmlview";
export const REPO_URL = "https://github.com/sebdanielsson/johnson-racing-tunes";

// Build-time git commit (injected via vite.config.ts `define`).
export const COMMIT_SHA = typeof __COMMIT_SHA__ === "string" ? __COMMIT_SHA__ : "";
export const COMMIT_SHORT = COMMIT_SHA.slice(0, 7);
export const COMMIT_URL = COMMIT_SHA ? `${REPO_URL}/commit/${COMMIT_SHA}` : REPO_URL;
