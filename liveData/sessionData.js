const request = require('request');
const { port } = require('../server/index.js');
const { log } = require('../server/index.js');
const { generateUser } = require('../database/dummyData/seedData.js');

const genQuery = () => {
  const initialObj = generateUser(1000000, new Date());
  const moviesWatched = Math.random() * 5;
  initialObj.recs = moviesWatched * initialObj.ratio;
  initialObj.nonRecs = moviesWatched - initialObj.recs;
  delete initialObj.ratio;
  return initialObj;
};

// make post request to /sessionData
const options = () => ({
  url: `http://localhost:${port}/sessionData`,
  qs: genQuery(),
});

const cb = (err, res) => {
  if (err) {
    log(err);
    console.error('Error making post request to sessiondata', err);
    return;
  }
  log(res.statusCode);
};

setInterval(() => (request.post(options(), cb)), 5000);
