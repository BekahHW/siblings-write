import type { WorkExperience } from '../content/schemas/workExperience';

export interface WorkPresentation {
  bookshopUrl?: string;
  cinematicHero: boolean;
  quizUrl?: string;
}

export function getWorkPresentation(experience?: WorkExperience): WorkPresentation {
  return {
    bookshopUrl: experience?.presentation?.bookshopUrl,
    cinematicHero: experience?.presentation?.cinematicHero ?? false,
    quizUrl: experience?.presentation?.quizUrl,
  };
}
