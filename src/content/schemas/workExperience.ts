import { z } from 'zod';

export const workWorlds = ['valley', 'christmas', 'island', 'sandbridge'] as const;

export const workExperienceSchema = z.object({
  world: z.enum(workWorlds),
  archiveRecord: z.number().int().positive(),
  storyClassifications: z.array(z.string().min(1)).min(1),
  location: z.string().min(1),
  librarianNote: z.string().min(1),
  secretText: z.string().min(1).optional(),
  presentation: z.object({
    bookshopUrl: z.string().url().optional(),
    cinematicHero: z.boolean().optional(),
    quizUrl: z.string().startsWith('/').optional(),
  }).optional(),
});

export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type WorkWorld = (typeof workWorlds)[number];
