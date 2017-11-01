const express = require('express');
const path = require('path');
const util = require('util');
const fs = require('fs');
const bodyParser = require('body-parser');
const seedData = require('../database/dummydata/seedData.js');
const movieData = require('../database/dummydata/movieData.js');
const genRecs = require('./genRecs.js');
const sessionData = require('./sessionData.js');
require('../database/movies/index.js');
require('../database/ratios/index.js');
require('../database/dashboard/dashboardData.js');

const app = express();
const port = 3000;
let logStream = fs.createWriteStream(path.resolve(__dirname, '../log.log'));
logStream.size = 0;
const log = (data) => {
  const req = data;
  req.date = new Date();
  logStream.write(`${util.format(JSON.stringify(req))}\n`);
  logStream.size += 1;
  if (logStream.size > 100) {
    logStream.end();
    logStream = fs.createWriteStream(path.resolve(__dirname, '../log.log'));
    logStream.size = 0;
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/dummydata', (req, res) => {
  seedData.genData(Number(req.query.entries))
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => (res.sendStatus(400)));
});

app.post('/moviedata', (req, res) => {
  movieData.genMovies()
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
  log({ action: 'post request /sessionData' });
  req.on('error', () => {
    log({ action: 'post request /sessionData', error: true });
  });
  if (!req.body.userId || !req.body.groupId || !req.body.recs || !req.body.nonRecs) {
    res.sendStatus(400);
  } else {
    sessionData(req.body)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        log({ action: 'post request /userData', error: true });
        console.error('Error posting session data', err);
      });
  }
});


/*
USER DATA INPUT:
{
  userId: 5783,
  profile: [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4],
  movieHistory: {543:1, 155:1, 1234:1, 2345:1, 267563:1, 103234:1,
  456:1, 23423:1, 78654:1, 1234:1, 2345:1, 64546:1, 87654:1, 235734:1, 298765:1}
}
*/
app.post('/userData', (req, res) => {
  // generate recommendations & send back to requester (refactor to publish to message bus)
  log({ action: 'post request /userData' });
  req.on('error', () => {
    log({ action: 'post request /userData', error: true });
  });
  if (!req.body.userId || !req.body.profile || !req.body.movieHistory) {
    res.sendStatus(400);
  } else {
    genRecs.getDists(req.body, (results) => {
      res.status(201).send(results);
    });
  }
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});

module.exports = {
  app,
  port,
  log,
};

require('../liveData/sessionData.js');
require('../liveData/userData.js');
