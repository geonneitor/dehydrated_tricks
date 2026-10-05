// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://dehydrated-tricks.vercel.app',
  // Order matters here! `sentry()` should come before `spotlightjs()`
  integrations: [
    sitemap(),
    sentry(),
    spotlightjs()
  ],
});
