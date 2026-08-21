import { defineConfig } from "oxfmt";

export default defineConfig({
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  trailingComma: "all",
  semi: true,
  printWidth: 100,
  sortPackageJson: true,
  /* Same stock Tailwind class sorting the JSON config had (experimentalTailwindcss: {}).
   * Deliberately not pointing it at src/index.css: that makes sorting theme-aware and
   * reformats most components, which is a change for its own PR, not this one. */
  sortTailwindcss: {},
  /* The only exclusion left, and it isn't a suppression: scripts/fetch-data.mjs writes this
   * with JSON.stringify() and no formatting, and Vercel regenerates it every deploy via
   * build:fresh — so formatting it here would make fmt:check fail on the build's own output. */
  ignorePatterns: ["src/data/tunes.json"],
});
