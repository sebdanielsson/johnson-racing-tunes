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
- [TanStack Table](https://tanstack.com/table)
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

The dataset lives in [`src/data/tunes.json`](src/data/tunes.json), normalized from
the five sheets of the source spreadsheet into a single typed shape (see
[`src/data/tunes.ts`](src/data/tunes.ts)). To refresh it, re-export the sheets and
re-run the normalizer.

## Deployment

Deployed on [Vercel](https://vercel.com) — a static build (`pnpm build`, output
`dist/`), zero server runtime. Push to the default branch to trigger a deploy.
