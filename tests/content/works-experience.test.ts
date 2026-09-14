import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import {
  workExperienceSchema,
  workWorlds,
  type WorkExperience,
} from '../../src/content/schemas/workExperience';

const worksDirectory = path.resolve('src/content/works');
const workFiles = fs.readdirSync(worksDirectory).filter((file) => file.endsWith('.md'));

function readExperience(file: string): WorkExperience {
  const source = fs.readFileSync(path.join(worksDirectory, file), 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];

  if (!frontmatter) {
    throw new Error(`${file} does not contain YAML frontmatter`);
  }

  const data = yaml.load(frontmatter) as { experience?: unknown };
  return workExperienceSchema.parse(data.experience);
}

describe('work experience content', () => {
  it('validates every real work entry against the reusable schema', () => {
    expect(workFiles).toHaveLength(4);

    for (const file of workFiles) {
      expect(() => readExperience(file)).not.toThrow();
    }
  });

  it('assigns every current world and a unique archive record', () => {
    const experiences = workFiles.map(readExperience);

    expect(experiences.map(({ world }) => world).sort()).toEqual([...workWorlds].sort());
    expect(new Set(experiences.map(({ archiveRecord }) => archiveRecord)).size).toBe(workFiles.length);
  });

  it('keeps detail-page capabilities in content metadata', () => {
    const experiences = Object.fromEntries(
      workFiles.map((file) => [file, readExperience(file)]),
    );
    const christmas = experiences['battle-for-christmas.md'];

    expect(christmas.presentation).toEqual({
      bookshopUrl: 'https://dub.sh/bookshop-b4c',
      cinematicHero: true,
      quizUrl: '/works/battle-for-christmas/which-character-are-you',
    });

    for (const [file, experience] of Object.entries(experiences)) {
      if (file !== 'battle-for-christmas.md') {
        expect(experience.presentation).toBeUndefined();
      }
    }
  });
});
