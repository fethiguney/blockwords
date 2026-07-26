# BlockWords

A Minecraft-inspired English learning game for a 7th-grade student (Turkish MEB curriculum).
Built as a personal, non-commercial project — playable free in any browser, installable on iPhone as a PWA.

**▶ Play now:** https://fethiguney.github.io/blockwords/

## Tech

- [Phaser 3](https://phaser.io/) + TypeScript + Vite
- 100% static — no server, progress stored in `localStorage`
- Content (words, sentences, levels) lives in JSON files, separate from code

## Commands

```bash
npm run dev        # local dev server at http://localhost:5173
npm run build      # type-check + production build to dist/
npm run deploy     # build and publish to GitHub Pages (gh-pages branch)
npm run deploy:cf  # build and publish to Cloudflare Pages (backup host)
```

## Hosting notes

- Primary: **GitHub Pages** — `fethiguney.github.io/blockwords`
- Backup: **Cloudflare Pages** — `blockwords.pages.dev` (unreachable from Türkiye due to an ISP-level block on `*.pages.dev`, kept for access from abroad)
- GitHub Actions is not used for CI (account-level Actions lock); deployment is done locally via `npm run deploy`

## Docs

- [ANALYSIS.md](ANALYSIS.md) — requirements analysis and research (curriculum, platform, IP, game design)
- [PLAN.md](PLAN.md) — MVP development plan (sprints, data schemas, mechanic specs)
