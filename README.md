# Fluro Sheet Music Viewer

A client-side [Nuxt](https://nuxt.com) app for viewing sheet music stored in [Fluro](https://fluro.io), designed for use on stage (particularly on iPads). Log in with a Fluro account to browse upcoming service plans and songs, swipe through sheet music PDFs, and switch keys per song.

## Features

- **Service plans** — lists upcoming services with active plans and renders each plan's songs as swipeable PDF pages.
- **Songs** — searchable library of all songs with sheet music.
- **Custom setlists** — build local setlists (stored in the browser) with per-song key selection.
- **Key selection** — choose which sheet (key) to display per song; choices persist locally.
- **Offline-friendly caching** — song and sheet lists are cached in localStorage for 24 hours.
- **Display options** — dark mode and horizontal/vertical scroll direction.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on `http://localhost:3000` |
| `npm run build` | Build for production |
| `npm run generate` | Generate the static site |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint with ESLint |
| `npm run check` | Type-check with `nuxt typecheck` |

## Deployment

Pushes to `main` are built with the `github_pages` preset and deployed to GitHub Pages via `.github/workflows/deploy.yml`. Merged PRs labelled `no-deploy` skip deployment.

## Notes

- The app is fully client-rendered (`ssr: false`) and talks directly to the Fluro API (`api.fluro.io`).
- `pdfjs-dist` is pinned to v3.x and builds target Safari/iOS 14 (via `@vitejs/plugin-legacy`) to support older iPads.
- The `/ipad-sim` route is a dev-only page for testing PDF rendering; it is stripped from production builds.
