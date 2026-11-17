// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hosted on Cloudflare Workers. Update `site` if you rename the Worker
// or add a custom domain (it's used for the sitemap and RSS links).
export default defineConfig({
  site: 'https://definedonce.fedamo.workers.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
