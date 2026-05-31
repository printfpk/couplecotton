import amqp from 'amqplib';
import { env } from './env.js';

let channel = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('✅ Connected to RabbitMQ');
    return channel;
  } catch (error) {
    console.warn('⚠️ RabbitMQ connection warning:', error.message);
    return null;
  }
};

export const getChannel = () => channel;

