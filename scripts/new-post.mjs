// Usage: npm run new-post -- "My post title"
import { writeFileSync, existsSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) { console.error('Usage: npm run new-post -- "My post title"'); process.exit(1); }
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const file = `src/content/blog/${slug}.md`;
if (existsSync(file)) { console.error(`${file} already exists`); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
writeFileSync(file, `---
title: "${title.replace(/"/g, '\\"')}"
description: ""
pubDate: ${today}
tags: []
draft: true
---

Write here.
`);
console.log(`Created ${file}`);
