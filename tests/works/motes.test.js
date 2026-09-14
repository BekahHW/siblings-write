import { describe, it, expect } from 'vitest';
import { createLibraryMotes } from '../../src/lib/works/motes.ts';

describe('createLibraryMotes', () => {
  it('returns a stable sequence for a fixed seed', () => {
    const a = createLibraryMotes(10, 424242);
    const b = createLibraryMotes(10, 424242);
    expect(a).toEqual(b);
  });

  it('returns the expected number of motes', () => {
    expect(createLibraryMotes(5, 1)).toHaveLength(5);
  });
});
