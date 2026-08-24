// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { rewriteDocLinks } from './src/lib/rewrite-doc-links.mjs';
import { legacyRedirects } from './src/lib/legacy-redirects.mjs';

export default defineConfig({
  site: 'https://asm198x.github.io',
  integrations: [sitemap()],
  // The pages have moved twice. Neither old URL should become a 404.
  redirects: legacyRedirects(),
  markdown: {
    // The documentation is markdown written for mdBook, which resolved `.md`
    // links itself. Nothing does now, so this does.
    processor: satteri({ mdastPlugins: [rewriteDocLinks] }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // github-dark sets comments at #6a737d on #24292e — 3.05:1, which fails
      // AA and makes the commentary in every listing the least readable part
      // of it. github-dark-default is the same family at 6.15:1.
      theme: 'github-dark-default',
      wrap: true,
    },
  },
});
