const request = require('request');
const { port } = require('../server/index.js');
const { log } = require('../server/index.js');
const { genProfile } = require('../database/dummyData/movieData.js');

// make post request to /userData
// {
//   userId: 534356757834,
//   profile: {action: 33, comedy: 20, drama: 44, romance: 33,
//     SF: 2, ...},
//   movieHistory: [543, 155, ...]
// }
const genQuery = () => {
  const movieHistory = [];
  const moviesWatched = Math.random() * 5000;
  while (movieHistory.length < moviesWatched) {
    movieHistory.push(Math.floor(Math.random() * 300000));
  }
  return {
    userId: Math.floor(Math.random() * 1000000),
    profile: genProfile(),
    movieHistory,
  };
};

// make post request to /sessionData
const options = () => ({
  url: `http://localhost:${port}/userData`,
  json: true,
  body: genQuery(),
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
