/**
 * Recommendation Service
 *
 * Orchestrates couple fashion recommendations with:
 *   - Redis caching (TTL 1 hour)
 *   - RabbitMQ event publishing
 *   - Matching engine integration
 */
import { getRecommendations, getCoupleMatches } from './matchingEngine.js';
import productModel from '../models/product.model.js';
import redisClient from '../../config/redis.js';
import { publishToQueue } from '../broker/brokers.js';
import mongoose from 'mongoose';

const CACHE_TTL = 3600; // 1 hour in seconds
const CACHE_PREFIX = 'recommend:';

/* ── RabbitMQ Event Names ────────────────────────────────────── */
export const EVENTS = {
  GENERATED:     'recommendation.generated',
  CLICKED:       'recommendation.clicked',
  ADDED_TO_CART: 'recommendation.added_to_cart',
  PURCHASED:     'recommendation.purchased',
};

/* ── Main Recommendation Method ──────────────────────────────── */

/**
 * Get partner outfit recommendations for a product.
 * Results are cached in Redis for 1 hour.
 *
 * @param {string} productId
 * @param {number} limit - max recommendations to return (default 10)
 * @returns {Promise<{ sourceProduct: Object, recommendations: Array }>}
 */
export async function getPartnerRecommendations(productId, limit = 10) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  // ── Check Redis cache ──
  const cacheKey = `${CACHE_PREFIX}${productId}`;
  try {
    if (redisClient?.status === 'ready') {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Re-fetch the source product in case it was updated
        const sourceProduct = await productModel.findById(productId).lean();
        return { sourceProduct, recommendations: parsed };
      }
    }
  } catch (err) {
    console.warn('Redis cache read failed (non-fatal):', err.message);
  }

  // ── Compute recommendations ──
  const sourceProduct = await productModel.findById(productId).lean();
  if (!sourceProduct) {
    throw new Error('Product not found');
  }

  // 1. Exact couple matches (pairGroupId) — always on top
  const coupleMatches = await getCoupleMatches(productId);

  // 2. Scored recommendations from matching engine
  const engineResults = await getRecommendations(productId, limit + 10);

  // 3. Merge: couple matches first, then engine results (deduplicated)
  const coupleIds = new Set(coupleMatches.map(m => m.product._id.toString()));
  const uniqueEngine = engineResults.filter(
    r => !coupleIds.has(r.product._id.toString())
  );

  const allRecommendations = [...coupleMatches, ...uniqueEngine].slice(0, limit);

  // ── Write to Redis cache ──
  try {
    if (redisClient?.status === 'ready') {
      await redisClient.set(cacheKey, JSON.stringify(allRecommendations), 'EX', CACHE_TTL);
    }
  } catch (err) {
    console.warn('Redis cache write failed (non-fatal):', err.message);
  }

  // ── Publish RabbitMQ event ──
  try {
    await publishToQueue(EVENTS.GENERATED, {
      sourceProductId: productId,
      sourceGender: sourceProduct.gender,
      sourceCategory: sourceProduct.category,
      recommendationCount: allRecommendations.length,
      topScore: allRecommendations[0]?.score ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal: recommendation still works without RabbitMQ
    console.warn('RabbitMQ publish failed (non-fatal):', err.message);
  }

  return { sourceProduct, recommendations: allRecommendations };
}

/* ── Event Tracking Helpers (for future use) ─────────────────── */

/**
 * Track when a user clicks on a recommendation.
 */
export async function trackRecommendationClick(sourceProductId, recommendedProductId, userId) {
  try {
    await publishToQueue(EVENTS.CLICKED, {
      sourceProductId,
      recommendedProductId,
      userId: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to track recommendation click:', err.message);
  }
}

/**
 * Track when a recommended product is added to cart.
 */
export async function trackRecommendationAddToCart(sourceProductId, recommendedProductId, userId) {
  try {
    await publishToQueue(EVENTS.ADDED_TO_CART, {
      sourceProductId,
      recommendedProductId,
      userId: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to track recommendation add-to-cart:', err.message);
  }
}

/**
 * Track when a recommended product is purchased.
 */
export async function trackRecommendationPurchase(sourceProductId, recommendedProductId, userId) {
  try {
    await publishToQueue(EVENTS.PURCHASED, {
      sourceProductId,
      recommendedProductId,
      userId: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to track recommendation purchase:', err.message);
  }
}

/**
 * Invalidate the cache for a product (e.g. when product is updated/deleted).
 */
export async function invalidateRecommendationCache(productId) {
  try {
    if (redisClient?.status === 'ready') {
      await redisClient.del(`${CACHE_PREFIX}${productId}`);
    }
  } catch (err) {
    console.warn('Failed to invalidate recommendation cache:', err.message);
  }
}
