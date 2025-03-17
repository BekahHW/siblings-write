import { defineCollection, z } from 'astro:content';

// Define the schema for the authors collection
const authorsCollection = defineCollection({
  type: 'content', // 'content' for Markdown files with frontmatter
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});

// Define the schema for the blog collection
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    author: z.string(), // References an author ID
  }),
});

// Export the collections
export const collections = {
  'authors': authorsCollection,
  'blog': blogCollection,
};