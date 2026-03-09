import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "../cms/user/pages" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        // Add other fields from your Grav header as needed
    }),
});

export const collections = { pages };
