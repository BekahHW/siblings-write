import { describe, it, expect, beforeEach } from 'vitest';
import {
  getVisitedWorkIds,
  markWorkVisited,
  hasVisitedAnyWork,
} from '../../src/lib/library/storage.ts';

describe('library storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tracks visited works', () => {
    markWorkVisited('escape-from-browns-island');
    expect(getVisitedWorkIds()).toContain('escape-from-browns-island');
    expect(hasVisitedAnyWork()).toBe(true);
  });

  it('deduplicates visited ids', () => {
    markWorkVisited('battle-for-christmas');
    markWorkVisited('battle-for-christmas');
    expect(getVisitedWorkIds()).toEqual(['battle-for-christmas']);
  });
});
