import { beforeEach, describe, expect, it } from 'vitest';
import {
  SECRET_DISCOVERY_KEY,
  VISITED_WORKS_KEY,
  hasDiscoveredLibrarySecret,
  markWorkVisited,
  readVisitedWorks,
  rememberLibrarySecret,
} from '../../src/scripts/library-memory';

describe('library memory', () => {
  beforeEach(() => localStorage.clear());

  it('stores visited works once and reads them back', () => {
    expect(markWorkVisited('escape-from-browns-island')).toBe(true);
    expect(markWorkVisited('escape-from-browns-island')).toBe(true);
    expect(markWorkVisited('battle-for-christmas')).toBe(true);

    expect(readVisitedWorks()).toEqual([
      'escape-from-browns-island',
      'battle-for-christmas',
    ]);
  });

  it('treats malformed or invalid visited data as empty', () => {
    localStorage.setItem(VISITED_WORKS_KEY, '{not json');
    expect(readVisitedWorks()).toEqual([]);

    localStorage.setItem(VISITED_WORKS_KEY, JSON.stringify({ work: 'valley' }));
    expect(readVisitedWorks()).toEqual([]);
  });

  it('filters invalid entries and removes duplicates', () => {
    localStorage.setItem(
      VISITED_WORKS_KEY,
      JSON.stringify(['valley', '', 4, 'valley', 'island']),
    );
    expect(readVisitedWorks()).toEqual(['valley', 'island']);
  });

  it('fails safely when storage access is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new DOMException('blocked');
      },
      setItem: () => {
        throw new DOMException('blocked');
      },
    };

    expect(readVisitedWorks(blocked)).toEqual([]);
    expect(markWorkVisited('valley', blocked)).toBe(false);
    expect(hasDiscoveredLibrarySecret(blocked)).toBe(false);
    expect(rememberLibrarySecret(blocked)).toBe(false);
  });

  it('remembers secret discovery without exposing storage errors', () => {
    expect(hasDiscoveredLibrarySecret()).toBe(false);
    expect(rememberLibrarySecret()).toBe(true);
    expect(localStorage.getItem(SECRET_DISCOVERY_KEY)).toBe('true');
    expect(hasDiscoveredLibrarySecret()).toBe(true);
  });
});
