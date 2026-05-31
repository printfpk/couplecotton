import Redis from 'ioredis';
import { env } from '../../config/env.js';

let redisClient;
if (env.REDIS_HOST && env.REDIS_PASSWORD) {
  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    username: env.REDIS_USERNAME || 'default',
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.error('Redis Memory: giving up after 3 retries, using in-memory fallback');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });
  
  redisClient.on('error', (err) => {
    // Only log once, not on every retry
    if (!redisClient._errorLogged) {
      console.error('Redis Memory Error:', err.message);
      redisClient._errorLogged = true;
    }
  });

  // Attempt to connect (non-blocking)
  redisClient.connect().catch(() => {});
}

// Fallback in-memory map if Redis is not configured or fails
const fallbackMemory = new Map();

const TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function getConversationMemory(userId, conversationId) {
  const key = `chat_memory:${userId}:${conversationId}`;
  try {
    if (redisClient && redisClient.status === 'ready') {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : [];
    }
    return fallbackMemory.get(key) || [];
  } catch (err) {
    console.error('Failed to get conversation memory:', err);
    return fallbackMemory.get(key) || [];
  }
}

export async function saveConversationMemory(userId, conversationId, messages) {
  const key = `chat_memory:${userId}:${conversationId}`;
  
  // To prevent memory bloat, only keep the last 20 messages
  const trimmedMessages = messages.slice(-20);
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.set(key, JSON.stringify(trimmedMessages), 'EX', TTL_SECONDS);
    } else {
      fallbackMemory.set(key, trimmedMessages);
    }
  } catch (err) {
    console.error('Failed to save conversation memory:', err);
    fallbackMemory.set(key, trimmedMessages);
  }
}
