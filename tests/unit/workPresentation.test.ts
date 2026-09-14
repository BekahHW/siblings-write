import { describe, expect, it } from 'vitest';
import type { WorkExperience } from '../../src/content/schemas/workExperience';
import { getWorkPresentation } from '../../src/utils/workPresentation';

const experience: WorkExperience = {
  world: 'christmas',
  archiveRecord: 2,
  storyClassifications: ['Holiday fantasy'],
  location: 'The realm of the Nutcrackers',
  librarianNote: 'Open in December.',
  presentation: {
    bookshopUrl: 'https://example.com/book',
    cinematicHero: true,
    quizUrl: '/quiz',
  },
};

describe('getWorkPresentation', () => {
  it('returns explicit presentation capabilities', () => {
    expect(getWorkPresentation(experience)).toEqual({
      bookshopUrl: 'https://example.com/book',
      cinematicHero: true,
      quizUrl: '/quiz',
    });
  });

  it('returns safe defaults when experience metadata is absent', () => {
    expect(getWorkPresentation()).toEqual({
      bookshopUrl: undefined,
      cinematicHero: false,
      quizUrl: undefined,
    });
  });

  it('defaults an omitted cinematic capability to false', () => {
    expect(getWorkPresentation({
      ...experience,
      presentation: { quizUrl: '/quiz' },
    })).toEqual({
      bookshopUrl: undefined,
      cinematicHero: false,
      quizUrl: '/quiz',
    });
  });
});
