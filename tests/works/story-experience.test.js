import { describe, it, expect } from 'vitest';
import {
  resolveStoryWorld,
  formatLibraryRecordLabel,
  storyWorldSchema,
} from '../../src/lib/storyExperience.ts';

describe('storyExperience', () => {
  it('validates known story worlds', () => {
    expect(storyWorldSchema.parse('valley')).toBe('valley');
    expect(storyWorldSchema.parse('island')).toBe('island');
  });

  it('resolves world from experience metadata', () => {
    const work = {
      id: 'escape-from-browns-island',
      data: {
        experience: {
          recordNumber: '003',
          location: 'Ohio River',
          classification: ['Adventure'],
          world: 'island',
        },
      },
    };
    expect(resolveStoryWorld(work)).toBe('island');
  });

  it('falls back to legacy id map when experience is missing', () => {
    const work = { id: 'battle-for-christmas', data: {} };
    expect(resolveStoryWorld(work)).toBe('christmas');
  });

  it('formats library record labels', () => {
    expect(formatLibraryRecordLabel('003')).toBe('LIBRARY RECORD · 003');
  });
});
