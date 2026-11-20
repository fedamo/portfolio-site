// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hosted on Cloudflare Workers at definedonce.dev (also reachable at definedonce.fedamo.workers.dev)
// or add a custom domain (it's used for the sitemap and RSS links).
export default defineConfig({
  site: 'https://definedonce.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
