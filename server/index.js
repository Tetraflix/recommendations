const express = require('express');
const seedData = require('../database/dummydata/seedData.js');
const movieData = require('../database/dummydata/movieData.js');
const genRecs = require('./genRecs.js');
const sessionData = require('./sessionData.js');
require('../database/movies/index.js');
require('../database/ratios/index.js');

const app = express();
const port = 3000;

app.post('/dummydata', (req, res) => {
  seedData(Number(req.query.entries))
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

/*
SESSION DATA INPUT:
{
  userId: 534356757834,
  groupId: 1,
  recs: 1.0,
  nonRecs: 0.7
}
*/
app.post('/sessionData', (req, res) => {
  // store session data
});


/*
USER DATA INPUT:
{
  userId: 534356757834,
  profile: {action: 33, comedy: 20, drama: 44, romance: 33,
    SF: 2, ...},
  movieHistory: [543, 155, ...]
}
*/
app.post('/userData', (req, res) => {
  // generate recommendations
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});

module.exports = app;
