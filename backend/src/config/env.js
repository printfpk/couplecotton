import 'dotenv/config';

const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'NODE_ENV',
    'FRONTEND_URL'
];

export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

export function validateEnv() {
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error('Missing required environment variables: ' + missing.join(', '));
    }
}

// Call validate immediately
validateEnv();

