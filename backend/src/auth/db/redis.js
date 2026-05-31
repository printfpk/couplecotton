import Redis from 'ioredis';

let redis;

if (process.env.NODE_ENV === 'test') {

   // fake redis

   redis = new FakeRedis();

} else {

   redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
         if (times > 3) return null;
         return Math.min(times * 200, 2000);
      },
   });

   redis.on('error', () => {
      // Silenced — errors already logged by main redis config
   });

}

export default redis;