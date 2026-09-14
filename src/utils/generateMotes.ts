export interface LibraryMote {
  left: string;
  top: string;
  size: string;
  drift: string;
  delay: string;
  duration: string;
  opacity: string;
}

export function generateMotes(count = 10, initialSeed = 424242): LibraryMote[] {
  let seed = initialSeed;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  return Array.from({ length: count }, () => ({
    left: (random() * 100).toFixed(2),
    top: (18 + random() * 72).toFixed(2),
    size: (2 + random() * 4).toFixed(1),
    drift: (random() * 60 - 30).toFixed(0),
    delay: (random() * 18).toFixed(2),
    duration: (16 + random() * 16).toFixed(2),
    opacity: (0.28 + random() * 0.5).toFixed(2),
  }));
}
