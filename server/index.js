const express = require('express');
const seedData = require('../database/dummydata/seedData.js');
const movieData = require('../database/dummydata/movieData.js');
require('../database/movies/index.js');
require('../database/ratios/index.js');

const app = express();
const port = 3000;

app.post('/dummydata', (req, res) => {
  if (req.query.entries) {
    seedData(Number(req.query.entries))
      .then(() => {
        res.sendStatus(201);
      })
      .catch(() => (res.sendStatus(400)));
  } else {
    seedData()
      .then(() => {
        res.sendStatus(201);
      })
      .catch(() => (res.sendStatus(400)));
  }
});

app.post('/moviedata', (req, res) => {
  movieData();
  res.sendStatus(201);
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});

module.exports = app;
