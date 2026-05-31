/**
 * Style Compatibility Matrix for Couple Fashion Matching.
 *
 * Covers: style, fit, aesthetic, occasion, season
 * Each key is a metadata field value. Its inner object maps
 * other values to a compatibility score (0-100).
 *
 * If a pair is not listed, the engine falls back to a default score.
 */

/* ── STYLE compatibility ─────────────────────────────────────── */
export const styleMatrix = {
  streetwear: {
    streetwear: 100,
    casual: 75,
    korean: 70,
    sporty: 65,
    minimal: 60,
    bohemian: 35,
    oldmoney: 30,
    formal: 20,
  },
  casual: {
    casual: 90,
    streetwear: 75,
    korean: 70,
    sporty: 70,
    minimal: 80,
    bohemian: 60,
    oldmoney: 55,
    formal: 40,
  },
  formal: {
    formal: 100,
    oldmoney: 85,
    minimal: 70,
    korean: 50,
    casual: 40,
    sporty: 20,
    streetwear: 20,
    bohemian: 25,
  },
  korean: {
    korean: 100,
    minimal: 80,
    casual: 70,
    streetwear: 70,
    oldmoney: 55,
    formal: 50,
    sporty: 50,
    bohemian: 45,
  },
  minimal: {
    minimal: 100,
    korean: 80,
    oldmoney: 80,
    casual: 80,
    formal: 70,
    streetwear: 60,
    sporty: 50,
    bohemian: 45,
  },
  oldmoney: {
    oldmoney: 100,
    formal: 85,
    minimal: 80,
    korean: 55,
    casual: 55,
    bohemian: 35,
    sporty: 25,
    streetwear: 30,
  },
  bohemian: {
    bohemian: 100,
    casual: 60,
    korean: 45,
    minimal: 45,
    streetwear: 35,
    oldmoney: 35,
    sporty: 30,
    formal: 25,
  },
  sporty: {
    sporty: 100,
    casual: 70,
    streetwear: 65,
    korean: 50,
    minimal: 50,
    bohemian: 30,
    oldmoney: 25,
    formal: 20,
  },
};

export const DEFAULT_STYLE_SCORE = 45;

/* ── FIT compatibility ───────────────────────────────────────── */
export const fitMatrix = {
  oversized: {
    oversized: 100,
    relaxed: 85,
    regular: 65,
    tailored: 45,
    slim: 40,
  },
  relaxed: {
    relaxed: 100,
    oversized: 85,
    regular: 80,
    tailored: 55,
    slim: 50,
  },
  regular: {
    regular: 90,
    relaxed: 80,
    tailored: 75,
    oversized: 65,
    slim: 70,
  },
  tailored: {
    tailored: 100,
    regular: 75,
    slim: 80,
    relaxed: 55,
    oversized: 45,
  },
  slim: {
    slim: 100,
    tailored: 80,
    regular: 70,
    relaxed: 50,
    oversized: 40,
  },
};

export const DEFAULT_FIT_SCORE = 50;

/* ── AESTHETIC compatibility ─────────────────────────────────── */
export const aestheticMatrix = {
  soft: {
    soft: 100,
    clean: 90,
    preppy: 70,
    vintage: 65,
    y2k: 50,
    anime: 40,
    techwear: 30,
    grunge: 25,
  },
  clean: {
    clean: 100,
    soft: 90,
    preppy: 75,
    vintage: 60,
    y2k: 45,
    techwear: 50,
    anime: 35,
    grunge: 25,
  },
  y2k: {
    y2k: 100,
    anime: 70,
    grunge: 60,
    vintage: 55,
    techwear: 55,
    soft: 50,
    clean: 45,
    preppy: 40,
  },
  anime: {
    anime: 100,
    y2k: 70,
    grunge: 55,
    techwear: 50,
    vintage: 45,
    soft: 40,
    clean: 35,
    preppy: 30,
  },
  techwear: {
    techwear: 100,
    grunge: 60,
    y2k: 55,
    clean: 50,
    anime: 50,
    vintage: 35,
    soft: 30,
    preppy: 25,
  },
  vintage: {
    vintage: 100,
    grunge: 70,
    soft: 65,
    clean: 60,
    y2k: 55,
    preppy: 65,
    anime: 45,
    techwear: 35,
  },
  grunge: {
    grunge: 100,
    vintage: 70,
    techwear: 60,
    y2k: 60,
    anime: 55,
    soft: 25,
    clean: 25,
    preppy: 20,
  },
  preppy: {
    preppy: 100,
    clean: 75,
    soft: 70,
    vintage: 65,
    y2k: 40,
    anime: 30,
    techwear: 25,
    grunge: 20,
  },
};

export const DEFAULT_AESTHETIC_SCORE = 40;

/* ── OCCASION compatibility ──────────────────────────────────── */
export const occasionMatrix = {
  daily: {
    daily: 100,
    lounge: 80,
    travel: 80,
    date: 60,
    work: 55,
    party: 40,
    festival: 50,
    wedding: 20,
  },
  date: {
    date: 100,
    party: 75,
    daily: 60,
    festival: 55,
    work: 50,
    travel: 50,
    lounge: 40,
    wedding: 45,
  },
  party: {
    party: 100,
    date: 75,
    festival: 80,
    daily: 40,
    work: 30,
    wedding: 55,
    travel: 35,
    lounge: 25,
  },
  work: {
    work: 100,
    daily: 55,
    date: 50,
    travel: 55,
    lounge: 35,
    party: 30,
    wedding: 40,
    festival: 25,
  },
  travel: {
    travel: 100,
    daily: 80,
    lounge: 70,
    date: 50,
    work: 55,
    festival: 55,
    party: 35,
    wedding: 20,
  },
  lounge: {
    lounge: 100,
    daily: 80,
    travel: 70,
    date: 40,
    work: 35,
    festival: 35,
    party: 25,
    wedding: 15,
  },
  wedding: {
    wedding: 100,
    party: 55,
    date: 45,
    festival: 50,
    work: 40,
    daily: 20,
    travel: 20,
    lounge: 15,
  },
  festival: {
    festival: 100,
    party: 80,
    date: 55,
    travel: 55,
    daily: 50,
    wedding: 50,
    work: 25,
    lounge: 35,
  },
};

export const DEFAULT_OCCASION_SCORE = 40;

/* ── SEASON compatibility ────────────────────────────────────── */
export const seasonMatrix = {
  summer: {
    summer: 100,
    allseason: 80,
    spring: 70,
    monsoon: 55,
    winter: 30,
  },
  winter: {
    winter: 100,
    allseason: 80,
    monsoon: 55,
    spring: 45,
    summer: 30,
  },
  monsoon: {
    monsoon: 100,
    allseason: 80,
    summer: 55,
    winter: 55,
    spring: 60,
  },
  spring: {
    spring: 100,
    allseason: 85,
    summer: 70,
    monsoon: 60,
    winter: 45,
  },
  allseason: {
    allseason: 100,
    spring: 85,
    summer: 80,
    winter: 80,
    monsoon: 80,
  },
};

export const DEFAULT_SEASON_SCORE = 50;

/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Generic matrix lookup. Case-insensitive, symmetric, with fallback.
 */
export function lookupScore(matrix, defaultScore, valueA, valueB) {
  if (!valueA || !valueB) return 0;
  const a = valueA.toLowerCase().trim();
  const b = valueB.toLowerCase().trim();
  return matrix[a]?.[b] ?? matrix[b]?.[a] ?? defaultScore;
}
