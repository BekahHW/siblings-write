/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Add type declarations for the content collections API
declare module 'astro:content' {
    interface DefineCollectionConfig {
      type: 'content' | 'data';
      schema?: ZodSchema;
    }
  
    export function defineCollection(
      input: DefineCollectionConfig
    ): DefineCollectionConfig;
  
    export function getCollection(
      collection: string,
      filter?: (entry: CollectionEntry) => boolean
    ): Promise<CollectionEntry[]>;
  
    export function getEntry(
      collection: string,
      slug: string
    ): Promise<CollectionEntry>;
  
    type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };
  
    type ZodSchema = import('zod').ZodType<any>;
  
    interface CollectionEntry<T = any> {
      id: string;
      slug: string;
      body: string;
      collection: string;
      data: T;
      render(): Promise<{
        Content: import('astro').MarkdownInstance<{}>['Content'];
        headings: import('astro').MarkdownHeading[];
        remarkPluginFrontmatter: Record<string, any>;
      }>;
    }
  
    export const z: {
      string(): import('zod').ZodString;
      number(): import('zod').ZodNumber;
      boolean(): import('zod').ZodBoolean;
      date(): import('zod').ZodDate;
      object(shape: Record<string, import('zod').ZodTypeAny>): import('zod').ZodObject<any>;
      array(schema: import('zod').ZodTypeAny): import('zod').ZodArray<any>;
    };
  }