import rss from '@astrojs/rss';
import { getPosts } from '../lib';

export async function GET(context) {
  const posts = await getPosts();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return rss({
    title: 'Defined Once',
    description: 'Building governed, natural-language analytics on Snowflake in public.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `${base}/blog/${p.id}/`,
    })),
  });
}
