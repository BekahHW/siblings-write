import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Define the schema for the authors collection
const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});

// Define the schema for the blog collection
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    author: reference("authors"),
    hidden: z.boolean().optional(),
  }),
});

// Export the collections
export const collections = { authors, blog };
