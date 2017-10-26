const express = require('express');
const seedData = require('../database/dummydata/seedData.js');
const movieData = require('../database/dummydata/movieData.js');
require('../database/movies/index.js');
require('../database/ratios/index.js');

const app = express();
const port = 3000;

app.post('/dummydata', (req, res) => {
  const args = [];
  if (req.query.entries) {
    args.push(Number(req.query.entries));
  }
  seedData(...args)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => (res.sendStatus(400)));
});

app.post('/moviedata', (req, res) => {
  movieData()
    .then(() => res.sendStatus(201))
    .catch(err => console.error('Error posting dummy movie data', err));
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});

module.exports = app;
