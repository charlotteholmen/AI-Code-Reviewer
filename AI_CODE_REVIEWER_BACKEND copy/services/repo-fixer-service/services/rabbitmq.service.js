// services/rabbitmq.service.js
const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    await channel.assertQueue('repo_analysis_queue', { durable: true });
    await channel.assertExchange('repo_exchange', 'direct', { durable: true });
    await channel.bindQueue('repo_analysis_queue', 'repo_exchange', 'repo.analyze');
    
    console.log('✅ RabbitMQ connected');
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
  }
}

async function sendToQueue(message) {
  if (!channel) await connectRabbitMQ();
  
  channel.sendToQueue('repo_analysis_queue', Buffer.from(JSON.stringify(message)), {
    persistent: true
  });
}

module.exports = { connectRabbitMQ, sendToQueue };