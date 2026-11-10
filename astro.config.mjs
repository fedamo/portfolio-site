// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hosted on Cloudflare Pages. Update `site` if you rename the Pages project
// or add a custom domain (it's used for the sitemap and RSS links).
export default defineConfig({
  site: 'https://portfolio-site.pages.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
