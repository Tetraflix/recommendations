const redis = require('redis');

const port = process.env.PORT || 6379;
const redisClient = redis.createClient({ host: 'localhost', port });

redisClient.on('ready', () => {
  console.log(`Redis Client connected on Port ${port}`);
});

redisClient.on('error', (err) => {
  console.error(`Error connected Redis Client to Port ${port}`, err);
});

module.exports = redisClient;
