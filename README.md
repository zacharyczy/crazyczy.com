# crazyczy.com

The source for [crazyczy.com](https://crazyczy.com), Zachary Cheng's bilingual personal website.

## What is here

- Chinese and English writing, project notes, tags, RSS, and sitemap
- Light and dark themes that follow the visitor's system preference
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

The site currently uses explicit article route files under `app/<lang>/blog/<slug>/page.tsx`. Add the matching route when adding a new post.

## Deployment

Pushing to `main` runs the GitHub Actions deployment workflow and publishes the site to Cloudflare. The production domain is [crazyczy.com](https://crazyczy.com).

## Typography

The interface uses [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font), distributed under the SIL Open Font License 1.1. Article text uses a system serif font stack for readability.
