import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts: one Markdown file per post in src/content/blog/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    stage: z.number().int().min(0).max(7).optional(), // portfolio build stage 0-7
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false), // drafts show in `npm run dev`, never in the deployed site
  }),
});

// Dashboards: a Markdown "card" per dashboard; the dashboard itself is a
// self-contained HTML file in public/dashboards/<slug>/index.html
const dashboards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dashboards' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    path: z.string(), // e.g. "dashboards/sample-metrics/index.html" (relative to the site base)
    tools: z.array(z.string()).default([]),
    syntheticData: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, dashboards };
