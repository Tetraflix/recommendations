const express = require('express');
const redisClient = require('../database/movies/index.js');

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});
