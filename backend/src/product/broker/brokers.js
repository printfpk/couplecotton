import { connectRabbitMQ, getChannel } from '../../config/rabbitmq.js';

let isConnected = false;

export async function connect() {
    if (isConnected) return;
    const channel = await connectRabbitMQ();
    if (channel) isConnected = true;
}

export async function publishToQueue(queueName, data = {}) {
    if (!isConnected) await connect();
    const channel = getChannel();
    if (!channel) return; // Silent fail or handle correctly if rabbit is down

    await channel.assertQueue(queueName, {
        durable: true
    });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log('Message sent to queue:', queueName, data);
}

export async function subscribeToQueue(queueName, callback) {
    if (!isConnected) await connect();
    const channel = getChannel();
    if (!channel) return; 

    await channel.assertQueue(queueName, {
        durable: true
    });

    channel.consume(queueName, async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
        }
    });
}

