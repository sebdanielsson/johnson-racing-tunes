# Johnson Racing Tunes

A fast, browsable frontend for the [Johnson Racing Tunes](https://www.youtube.com/channel/UCGK33hhvffYv5hUNqB0wVnQ)
community tune database — every Forza tune share code across **Horizon 6, 5, 4, 3**
and **Motorsport 7**, searchable, filterable and one tap to copy.

> Unofficial, fan-made. Tune data © the respective creators. Sourced from the
> public [Google Sheet](https://docs.google.com/spreadsheets/d/1F3xqy6yodUmnuua08YU-fet4KDDoIbaoNZRiZ9U8yxk/htmlview).

## Features

- **Browse** — 884 tunes in a sortable, paginated table with global search and
  filters for game, class and tune focus.
- **Copy codes** — click any share code to copy it to your clipboard.
- **Overview** — shadcn charts breaking down tunes by game, class, top creators
  and tune focus.
- **Video links** — jump straight to the Johnson Racing Tunes video each tune was
  featured in.
- Dark-first design with a light theme, fully responsive.

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (new-york) + [shadcn charts](https://ui.shadcn.com/charts) / [Recharts](https://recharts.org)
- pnpm

## Development

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # production build to dist/
pnpm preview    # preview the production build
pnpm typecheck  # type-check the project
```

## Data

The dataset lives in [`src/data/tunes.json`](src/data/tunes.json), a compact,
dictionary-encoded snapshot of the five source sheets that
[`src/data/tunes.ts`](src/data/tunes.ts) expands into typed records — used as the
instant, offline-safe seed.

Data is refreshed **two ways**:

1. **At build time** — the Vercel deploy runs `pnpm build:fresh`
   ([`scripts/fetch-data.mjs`](scripts/fetch-data.mjs)) so each deploy bakes in
   the current sheet. Refresh the local snapshot the same way with `pnpm fetch-data`.
2. **At runtime** — the in-app **Refresh** button re-fetches and re-parses the
   sheets live ([`src/data/parse.ts`](src/data/parse.ts)) and swaps the dataset in
   without a redeploy.

Both paths reach Google Sheets through a same-origin proxy that avoids CORS: the
Vite dev server proxies `/sheets` (see [`vite.config.ts`](vite.config.ts)) and
Vercel rewrites it in production (see [`vercel.json`](vercel.json)). The
`gviz/tq?tqx=out:csv` endpoint is used because it returns CSV with a `200` (no
redirect), so the proxy stays transparent.

## Deployment

Deployed on [Vercel](https://vercel.com) — a static build, zero server runtime.
The build command is `pnpm build:fresh`, which re-fetches the data and then runs
`vite build` (output `dist/`).
