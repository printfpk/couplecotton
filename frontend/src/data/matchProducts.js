/* ═══════════════════════════════════════════════════════════════
   matchProducts.js — Partner Matching Utility
   
   Current: Simple tag + gender matching
   Future:  Replace with ML API call (see comment below)
   ═══════════════════════════════════════════════════════════════ */

import ALL_PRODUCTS from './products';

/**
 * Get partner product suggestions for the opposite gender.
 * 
 * @param {Object} product — The currently viewed product
 * @param {number} limit — Max number of suggestions to return
 * @returns {Object[]} — Array of suggested products
 * 
 * ── FUTURE ML INTEGRATION ──────────────────────────────────
 * To replace with ML, change this to:
 * 
 *   export async function getPartnerSuggestions(product, limit = 6) {
 *     const res = await fetch('/api/ml/match', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ slug: product.slug, tags: product.tags }),
 *     });
 *     return res.json();
 *   }
 */
export function getPartnerSuggestions(product, limit = 6) {
  const oppositeGender = product.gender === 'male' ? 'female' : 'male';

  // 1. If there's a direct match, put it first
  const directMatch = product.matchingSlug
    ? ALL_PRODUCTS.find(p => p.slug === product.matchingSlug)
    : null;

  // 2. Filter by opposite gender, exclude direct match and self
  const candidates = ALL_PRODUCTS.filter(
    p =>
      p.slug !== product.slug &&
      p.slug !== product.matchingSlug &&
      (p.gender === oppositeGender || p.gender === 'unisex')
  );

  // 3. Score by shared tags
  const scored = candidates.map(p => {
    const sharedTags = product.tags.filter(t => p.tags.includes(t)).length;
    const sameType = p.type === product.type ? 2 : 0;
    return { product: p, score: sharedTags + sameType };
  });

  // 4. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 5. Build result: direct match first, then scored matches
  const results = [];
  if (directMatch) results.push(directMatch);
  for (const { product: p } of scored) {
    if (results.length >= limit) break;
    if (!results.find(r => r.slug === p.slug)) {
      results.push(p);
    }
  }

  return results;
}

/**
 * Get "Complete The Look" suggestions — same gender, different type.
 */
export function getCompleteTheLook(product, limit = 4) {
  return ALL_PRODUCTS.filter(
    p =>
      p.slug !== product.slug &&
      p.gender === product.gender &&
      p.type !== product.type
  ).slice(0, limit);
}

/**
 * Get related products — same type, any gender.
 */
export function getRelatedProducts(product, limit = 4) {
  return ALL_PRODUCTS.filter(
    p => p.slug !== product.slug && p.type === product.type
  ).slice(0, limit);
}
