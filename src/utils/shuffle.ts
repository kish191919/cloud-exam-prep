/**
 * Deterministic seeded shuffle using Fisher-Yates + LCG.
 * Same seed always produces the same order, so the displayed
 * option order is stable across re-renders and keyboard events.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  if (!array || array.length === 0) return array;

  const arr = [...array];
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    const chr = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = hash | 0;
  }

  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) | 0;
    const j = Math.abs(hash) % (i + 1);
    if (j >= 0 && j <= i && arr[i] !== undefined && arr[j] !== undefined) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
}
