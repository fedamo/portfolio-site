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

export const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
