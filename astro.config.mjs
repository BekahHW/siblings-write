import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';
import { defineConfig } from "astro/config";
import sentry from "@sentry/astro";


// https://astro.build/config
export default defineConfig({
  site: 'https://www.siblingswrite.com/',
  integrations: [
    mdx(),
    svelte(),
     sentry({
      project: "siblings-write",
      org: "siblings-write",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    sitemap({
      filter: (page) => !page.includes('/authors/') || page.endsWith('/authors/zach') || page.endsWith('/authors/josh') || page.endsWith('/authors/bekah'),
      changefreq: 'weekly',
      priority: 0.7,
      customPages: [
        'https://www.siblingswrite.com/',
        'https://www.siblingswrite.com/blog',
        'https://www.siblingswrite.com/works'
      ]
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'nord'
    },
    remarkPlugins: [remarkGfm, remarkSmartypants],
    rehypePlugins: [[rehypeExternalLinks, {
      target: '_blank'
    }]]
  }
});