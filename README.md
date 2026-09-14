# crazyczy.com

The source for [crazyczy.com](https://crazyczy.com), Zachary Cheng's English-first personal website with Chinese support.

## What is here

- English writing and project notes with Chinese translations, tags, RSS, and sitemap
- Light theme by default, with a saved dark-theme option
- Two small browser games: Snake and Starflight
- An interactive, sandboxed terminal-style navigation page
- Responsive layouts and accessible reduced-motion behavior
- Automatic deployment to Cloudflare from the `main` branch

## Local development

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

The local development server is available at `http://localhost:3000`.

Before publishing:

```bash
npm run lint
npm run build
```

## Writing

Posts live in `content/posts/zh` and `content/posts/en`. Each translation pair shares a `translationKey`, while either language can be published independently.

The site currently uses explicit article route files under `app/blog/<slug>/page.tsx` (English) and `app/blog/<slug>/zh/page.tsx` (Chinese). Add the matching route when adding a new post.

## Deployment

Pushing to `main` runs the GitHub Actions deployment workflow and publishes the site to Cloudflare. The production domain is [crazyczy.com](https://crazyczy.com).

## Typography

The interface uses [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font), distributed under the SIL Open Font License 1.1. Article text uses a system serif font stack for readability.

## Addresses and room location

English is the primary site: `/blog/`, `/projects/`, `/about/`. Chinese translations append `/zh/`: `/blog/zh/`, `/blog/<slug>/zh/`. `/zh/` is the Chinese welcome room. Old `/en/...` and `/zh/...` URLs permanently redirect to their corresponding canonical pages. The default RSS feed contains English articles.

The worker serves `/api/visitor-location` directly from Cloudflare's original request metadata. It returns rounded approximate network coordinates and a location label, never the IP address, and uses private/no-store caching. No location is retained in browser storage or the database. VPNs can change this estimate. Local development or unavailable metadata leaves the map unmarked. The wooden door opens onto a preview generated from the current Writing titles, then navigates to the canonical Writing page.
