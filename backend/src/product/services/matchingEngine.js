/**
 * Couple Fashion Matching Engine
 *
 * Calculates compatibility scores between products for couple outfit
 * recommendations. Uses weighted scoring across multiple fashion dimensions.
 *
 * Scoring weights (total 100%):
 *   Color:      30%
 *   Style:      25%
 *   Fit:        15%
 *   Aesthetic:  15%
 *   Occasion:   10%
 *   Season:      5%
 *
 * PairGroupId match overrides scoring → automatic score 100.
 */
import productModel from '../models/product.model.js';
import mongoose from 'mongoose';

import { getColorScore } from '../config/colorCompatibility.js';
import {
  styleMatrix, DEFAULT_STYLE_SCORE,
  fitMatrix, DEFAULT_FIT_SCORE,
  aestheticMatrix, DEFAULT_AESTHETIC_SCORE,
  occasionMatrix, DEFAULT_OCCASION_SCORE,
  seasonMatrix, DEFAULT_SEASON_SCORE,
  lookupScore,
} from '../config/styleCompatibility.js';

/* ── Scoring Weights ─────────────────────────────────────────── */
const WEIGHTS = {
  color: 0.30,
  style: 0.25,
  fit: 0.15,
  aesthetic: 0.15,
  occasion: 0.10,
  season: 0.05,
};

/* ── Score Calculation ────────────────────────────────────────── */

/**
 * Calculate a detailed match score between a source product and a candidate.
 *
 * @param {Object} source   - The product being viewed
 * @param {Object} candidate - A potential recommendation
 * @returns {{ score: number, reasons: string[] }}
 */
export function calculateMatchScore(source, candidate) {
  const reasons = [];

  // ── PairGroup Override ──
  if (
    source.pairGroupId &&
    candidate.pairGroupId &&
    source.pairGroupId === candidate.pairGroupId
  ) {
    reasons.push('Official couple pair (same collection)');
    return { score: 100, reasons };
  }

  // ── Dimensional scores (each 0-100) ──

  // Color
  const colorScore = getColorScore(
    source.fashion?.color,
    candidate.fashion?.color
  );
  if (colorScore >= 80) {
    reasons.push(`Great color match (${source.fashion?.color || '?'} × ${candidate.fashion?.color || '?'})`);
  } else if (colorScore >= 60) {
    reasons.push(`Compatible colors (${source.fashion?.color || '?'} × ${candidate.fashion?.color || '?'})`);
  }

  // Style
  const styleScore = lookupScore(
    styleMatrix, DEFAULT_STYLE_SCORE,
    source.fashion?.style,
    candidate.fashion?.style
  );
  if (styleScore >= 80) {
    reasons.push(`Matching ${candidate.fashion?.style || ''} style`);
  } else if (styleScore >= 60) {
    reasons.push(`Compatible ${candidate.fashion?.style || ''} style`);
  }

  // Fit
  const fitScore = lookupScore(
    fitMatrix, DEFAULT_FIT_SCORE,
    source.fashion?.fit,
    candidate.fashion?.fit
  );
  if (fitScore >= 80) {
    reasons.push(`Matching ${candidate.fashion?.fit || ''} fit`);
  } else if (fitScore >= 60) {
    reasons.push(`Compatible fit`);
  }

  // Aesthetic
  const aestheticScore = lookupScore(
    aestheticMatrix, DEFAULT_AESTHETIC_SCORE,
    source.fashion?.aesthetic,
    candidate.fashion?.aesthetic
  );
  if (aestheticScore >= 80) {
    reasons.push(`Matching ${candidate.fashion?.aesthetic || ''} aesthetic`);
  } else if (aestheticScore >= 60) {
    reasons.push(`Compatible aesthetic`);
  }

  // Occasion
  const occasionScore = lookupScore(
    occasionMatrix, DEFAULT_OCCASION_SCORE,
    source.fashion?.occasion,
    candidate.fashion?.occasion
  );
  if (occasionScore >= 80) {
    reasons.push(`Perfect for ${candidate.fashion?.occasion || 'same'} occasions`);
  }

  // Season
  const seasonScore = lookupScore(
    seasonMatrix, DEFAULT_SEASON_SCORE,
    source.fashion?.season,
    candidate.fashion?.season
  );
  if (seasonScore >= 80) {
    reasons.push(`Great for ${candidate.fashion?.season || 'the same'} season`);
  }

  // ── Weighted total ──
  const finalScore = Math.round(
    colorScore * WEIGHTS.color +
    styleScore * WEIGHTS.style +
    fitScore * WEIGHTS.fit +
    aestheticScore * WEIGHTS.aesthetic +
    occasionScore * WEIGHTS.occasion +
    seasonScore * WEIGHTS.season
  );

  // Category bonus reason (informational, not scored separately)
  if (source.category && source.category === candidate.category) {
    reasons.push(`Same category (${candidate.category})`);
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push('Potential partner outfit');
  }

  return { score: finalScore, reasons };
}

/* ── Get Recommendations ─────────────────────────────────────── */

/**
 * Fetch and rank partner outfit recommendations for a given product.
 *
 * Gender rules: male → female, female → male, unisex → both.
 * Category priority: same category products ranked first.
 *
 * @param {string} productId
 * @param {number} limit
 * @returns {Promise<Array<{ product: Object, score: number, reasons: string[] }>>}
 */
export async function getRecommendations(productId, limit = 10) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const sourceProduct = await productModel.findById(productId).lean();
  if (!sourceProduct) {
    throw new Error('Product not found');
  }

  // Determine target gender(s)
  let targetGenders;
  if (sourceProduct.gender === 'male') {
    targetGenders = ['female', 'unisex'];
  } else if (sourceProduct.gender === 'female') {
    targetGenders = ['male', 'unisex'];
  } else {
    targetGenders = ['male', 'female', 'unisex'];
  }

  // Fetch candidates: same category first, then others
  const candidates = await productModel.find({
    _id: { $ne: sourceProduct._id },
    gender: { $in: targetGenders },
    isActive: true,
  }).limit(500).lean();

  // Score all candidates
  const scored = candidates.map(candidate => {
    const { score, reasons } = calculateMatchScore(sourceProduct, candidate);
    return { product: candidate, score, reasons };
  });

  // Sort: score descending, then same-category first as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aMatch = a.product.category === sourceProduct.category ? 1 : 0;
    const bMatch = b.product.category === sourceProduct.category ? 1 : 0;
    return bMatch - aMatch;
  });

  return scored.slice(0, limit);
}

/* ── Get Exact Couple Matches ────────────────────────────────── */

/**
 * Get products that share the same pairGroupId (the "designed-as-a-pair"
 * couple match). These always get score 100.
 *
 * @param {string} productId
 * @returns {Promise<Array<{ product: Object, score: number, reasons: string[] }>>}
 */
export async function getCoupleMatches(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const sourceProduct = await productModel.findById(productId).lean();
  if (!sourceProduct || !sourceProduct.pairGroupId) {
    return [];
  }

  const oppositeGender =
    sourceProduct.gender === 'male' ? 'female' :
    sourceProduct.gender === 'female' ? 'male' : 'unisex';

  const matches = await productModel.find({
    pairGroupId: sourceProduct.pairGroupId,
    gender: oppositeGender,
    _id: { $ne: sourceProduct._id },
    isActive: true,
  }).lean();

  return matches.map(product => ({
    product,
    score: 100,
    reasons: ['Official couple pair (same collection)'],
  }));
}
