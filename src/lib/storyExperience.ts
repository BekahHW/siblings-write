import { z } from 'zod';
import type { CollectionEntry } from 'astro:content';

export const storyWorldSchema = z.enum(['valley', 'christmas', 'island', 'sandbridge']);
export type StoryWorld = z.infer<typeof storyWorldSchema>;

export const workExperienceSchema = z.object({
  recordNumber: z.string(),
  location: z.string(),
  classification: z.array(z.string()).min(1),
  world: storyWorldSchema,
  librarianNote: z.string().optional(),
  secretText: z.string().optional(),
  showBookshop: z.boolean().optional(),
  cinematicHero: z.boolean().optional(),
  characterQuizHref: z.string().optional(),
});

export type WorkExperience = z.infer<typeof workExperienceSchema>;

/** Single fallback map while content catches up — not for presentation components. */
const LEGACY_WORLD_BY_ID: Record<string, StoryWorld> = {
  'the-valley-of-almost-true-things': 'valley',
  'battle-for-christmas': 'christmas',
  'escape-from-browns-island': 'island',
  'mitch-and-the-sand-bridge': 'sandbridge',
};

export function resolveStoryWorld(work: CollectionEntry<'works'>): StoryWorld {
  return work.data.experience?.world ?? LEGACY_WORLD_BY_ID[work.id] ?? 'valley';
}

export function resolveWorkExperience(work: CollectionEntry<'works'>): WorkExperience | null {
  return work.data.experience ?? null;
}

export function formatLibraryRecordLabel(recordNumber: string): string {
  return `LIBRARY RECORD · ${recordNumber}`;
}
