// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Hosted on the "portfolio-site" Cloudflare Worker, served at definedonce.dev and www.definedonce.dev
// or add a custom domain (it's used for the sitemap and RSS links).
export default defineConfig({
  site: 'https://definedonce.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
