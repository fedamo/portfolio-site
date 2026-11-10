// Usage: npm run new-project -- "Project name"
import { writeFileSync, existsSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) { console.error('Usage: npm run new-project -- "Project name"'); process.exit(1); }
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const file = `src/content/projects/${slug}.md`;
if (existsSync(file)) { console.error(`${file} already exists`); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
writeFileSync(file, `---
title: "${title.replace(/"/g, '\\"')}"
summary: ""
pubDate: ${today}
status: in-progress   # live | in-progress | archived
stack: []
# repoUrl: https://github.com/...   (public repos only)
# demoUrl: https://...
featured: false
draft: true
---

## The problem

## What I built

## How it works

## What I learned
`);
console.log(`Created ${file}`);
