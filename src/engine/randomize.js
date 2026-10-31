// Deterministic pseudo-random number generator (Mulberry32).
// Guarantees stable option shuffle orders for a given student & question,
// resisting cheat-copying on shared double-benches while keeping identical
// layout across language toggles (EN, Hinglish, Hindi).

function seededPRNG(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOptions(options, seedKey = '') {
  if (!options || options.length <= 1) return options || [];
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed << 5) - seed + seedKey.charCodeAt(i);
    seed |= 0;
  }
  const rng = seededPRNG(Math.abs(seed) || 12345);
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

