import { getCollection } from 'astro:content';

// Drafts are visible in `npm run dev` but excluded from production builds.
export const showDrafts = import.meta.env.DEV;
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => showDrafts || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getDashboards() {
  const items = await getCollection('dashboards', ({ data }) => showDrafts || !data.draft);
  return items.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getProjects() {
  const items = await getCollection('projects', ({ data }) => showDrafts || !data.draft);
  return items.sort((a, b) =>
    Number(b.data.featured) - Number(a.data.featured) || b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const statusLabel = { live: 'Live', 'in-progress': 'In progress', archived: 'Archived' } as const;

/** Estimated reading time in minutes, ignoring HTML comments and Markdown syntax. */
export function readingTime(body: string | undefined): number {
  const text = (body ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/[#*_`>\[\]()-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
