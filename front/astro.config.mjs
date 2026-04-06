// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: "https://glensing.dev",
  integrations: [react(), sitemap()],
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
  },
});