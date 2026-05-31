import Redis from 'ioredis';
import { env } from './env.js';

let redisClient;

try {
  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 5) {
        console.error('Redis connection failed');
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', env.NODE_ENV === 'development' ? err.message : err.message);
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
} catch (error) {
  console.error('Failed to initialize Redis:', error);
}

export default redisClient;

