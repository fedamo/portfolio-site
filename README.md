# Portfolio site: blog and dashboards

Public site, version-controlled in Git and deployed with
[Astro](https://astro.build) to Cloudflare Pages.

```
.
├── src/
│   ├── content/
│   │   ├── blog/            ← blog posts, one .md file each
│   │   └── dashboards/      ← one .md "card" per dashboard (title, description, link)
│   ├── content.config.ts    ← frontmatter schemas for posts and dashboards
│   ├── layouts/Base.astro   ← shared page shell (nav, footer)
│   ├── pages/               ← routes: /, /blog/, /blog/<slug>/, /dashboards/, /rss.xml
│   │   └── dashboards/*.astro ← D3 dashboards as site pages (D3 bundled from npm)
│   └── styles/global.css
├── public/
│   ├── dashboards/<slug>/index.html   ← self-contained HTML dashboards, copied as-is
│   └── data/                ← CSV/JSON that dashboards load at runtime
├── scripts/new-post.mjs     ← scaffolds a new draft post
```

## Everyday tasks

| Task | Command |
|---|---|
| Install (once) | `npm install` |
| Preview locally, drafts included | `npm run dev` then open http://localhost:4321/ |
| New blog post | `npm run new-post -- "My post title"` then edit `src/content/blog/<slug>.md` |
| Publish a post | set `draft: false` in its frontmatter, commit and push to `main` |
| Add a dashboard | put `index.html` in `public/dashboards/<slug>/`, add `src/content/dashboards/<slug>.md` |
| Add a D3 dashboard | copy `src/pages/dashboards/claims-trend.astro`, put data in `public/data/`, add a card in `src/content/dashboards/` with `path: "dashboards/<name>/"` |
| Production build check | `npm run build` (drafts are excluded) |

### Blog post frontmatter

```yaml
---
title: "Post title"
description: "One-sentence summary for cards and RSS."
pubDate: 2026-11-16
stage: 0          # optional: portfolio build stage 0-7
tags: [snowflake]
draft: true       # visible in `npm run dev`, hidden on the live site
---
```

## Deployment (Cloudflare Pages)

One-time setup in the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this
repo, choose the **Astro** framework preset (build command `npm run build`, output directory `dist`).
Node version comes from `.node-version`.

After that:
- Every push to `main` deploys to production.
- Every other branch gets its own preview URL, handy for checking a post before publishing.
- Custom domain: Pages project → **Custom domains**, then update `site` in `astro.config.mjs`.

This repo is public. Resume, job-search notes and anything personal live in a separate private repo.

## Rules for content

- Say "building" for anything not shipped yet. The blog is a record of real work.
- Dashboards use synthetic or public data only. No employer data, code or metric definitions.

## Dashboard notes

- Build URLs from `import.meta.env.BASE_URL` with the trailing slash stripped, e.g.
  `` `${import.meta.env.BASE_URL.replace(/\/$/, '')}/data/file.csv` ``, so links keep working if a base path is ever added.
- Parse CSV rows explicitly (as in `claims-trend.astro`) rather than with `d3.autoType`, which turns
  `YYYY-MM` strings into dates on its own.
- D3 transitions are dropped by the bundler with `import * as d3`; add `import 'd3-transition'` if you need them.
