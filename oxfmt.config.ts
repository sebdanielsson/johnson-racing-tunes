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
  ignorePatterns: ["dist/**", "src/data/tunes.json", "src/components/ui/**", "pnpm-lock.yaml"],
});
