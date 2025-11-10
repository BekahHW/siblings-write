import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
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
  integrations: [mdx(), svelte()],
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