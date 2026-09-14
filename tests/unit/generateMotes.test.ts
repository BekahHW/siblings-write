import { describe, expect, it } from 'vitest';
import { generateMotes } from '../../src/utils/generateMotes';

describe('generateMotes', () => {
  it('returns stable mote values for the same seed', () => {
    expect(generateMotes(3, 424242)).toEqual(generateMotes(3, 424242));
    expect(generateMotes(1, 424242)[0]).toEqual({
      left: '83.09',
      top: '63.60',
      size: '2.8',
      drift: '-2',
      delay: '16.59',
      duration: '31.04',
      opacity: '0.36',
    });
  });

  it('honors count and seed inputs', () => {
    expect(generateMotes(0)).toEqual([]);
    expect(generateMotes(1, 1)).not.toEqual(generateMotes(1, 2));
  });
});
