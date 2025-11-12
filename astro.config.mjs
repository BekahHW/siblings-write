import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';


// https://astro.build/config
export default defineConfig({
  site: 'https://www.siblingswrite.com/',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    mdx(),
    svelte(),
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
