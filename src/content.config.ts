import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pencil sketches available to posts, projects and dashboards (see src/components/Sketch.astro).
const sketch = z.enum(['worksheet', 'layers', 'book', 'chart', 'kpi', 'notebook', 'chat', 'pipeline']).optional();
// High-level skills a project or dashboard demonstrates, shown under its summary.
const skills = z.array(z.string()).max(5).default([]);

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
    sketch,
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
    path: z.string(), // e.g. "dashboards/portfolio-pulse/index.html" (relative to the site base)
    tools: z.array(z.string()).default([]),
    syntheticData: z.boolean().default(true),
    sketch,
    skills,
    draft: z.boolean().default(false),
  }),
});

// Projects: one Markdown file per personal or professional project.
// The body is the write-up shown on /projects/<slug>/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one or two sentences for the card
    pubDate: z.coerce.date(),
    status: z.enum(['live', 'in-progress', 'archived']).default('in-progress'),
    stack: z.array(z.string()).default([]),
    repoUrl: z.string().url().optional(), // only for public repos
    demoUrl: z.string().url().optional(),
    featured: z.boolean().default(false), // featured projects show on the home page
    sketch,
    skills,
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, dashboards, projects };
