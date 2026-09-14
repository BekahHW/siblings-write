/** Dust motes for the library room. Seeded PRNG so builds stay identical. */
export type LibraryMote = {
  left: string;
  top: string;
  size: string;
  drift: string;
  delay: string;
  duration: string;
  opacity: string;
};

export function createLibraryMotes(count = 10, seed = 424242): LibraryMote[] {
  let moteSeed = seed;
  const moteRnd = () => {
    moteSeed = (moteSeed * 1103515245 + 12345) % 2147483648;
    return moteSeed / 2147483648;
  };

  return Array.from({ length: count }, () => ({
    left: (moteRnd() * 100).toFixed(2),
    top: (18 + moteRnd() * 72).toFixed(2),
    size: (2 + moteRnd() * 4).toFixed(1),
    drift: (moteRnd() * 60 - 30).toFixed(0),
    delay: (moteRnd() * 18).toFixed(2),
    duration: (16 + moteRnd() * 16).toFixed(2),
    opacity: (0.28 + moteRnd() * 0.5).toFixed(2),
  }));
}
