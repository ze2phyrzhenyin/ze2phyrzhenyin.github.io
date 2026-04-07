import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['logic', 'math', 'ai', 'cs']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    math: z.boolean().default(false),
    toc: z.boolean().default(true),
    cover: z.string().optional(),
  }),
});

const essaysCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(['active', 'completed', 'archived']),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    paper: z.string().url().optional(),
    cover: z.string().optional(),
  }),
});

const publicationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    type: z.enum(['journal', 'conference', 'preprint', 'thesis']),
    abstract: z.string(),
    pdf: z.string().optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  essays: essaysCollection,
  projects: projectsCollection,
  publications: publicationsCollection,
};
