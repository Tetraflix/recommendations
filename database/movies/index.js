const redis = require('redis');

const redisClient = redis.createClient();

redisClient.on('ready', () => {
  console.log('Redis Client connected');
});

redisClient.on('error', (err) => {
  console.error('Error connected Redis Client', err);
});

module.exports = redisClient;
