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
    authors: z.array(reference("authors")),
    hidden: z.boolean().optional(),
    youtubeId: z.string().optional(),
  }),
});

// Define the schema for the CYOA (Choose Your Own Adventure) collection
const cyoa = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cyoa" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    author: reference("authors"),
    hidden: z.boolean().optional(),
  }),
});

// Define the schema for the works collection
const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    link: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

// Define the schema for the pages collection (JSON files)
const pages = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    about: z.string().optional(),
    newsletterIntro: z.string().optional(),
    intro: z.string().optional(),
    featuredTitle: z.string().optional(),
    otherProjectsTitle: z.string().optional(),
  }),
});

// Define the schema for the announcements collection
const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    ctaText: z.string().default("Preorder Now!"),
    ctaLink: z.string(),
    active: z.boolean().default(true),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    showOnce: z.boolean().default(true),
  }),
});

// Export the collections
export const collections = { authors, blog, cyoa, works, pages, announcements };
