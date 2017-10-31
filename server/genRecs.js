const redisClient = require('../database/movies/index.js');

/*
USER DATA INPUT:
{
  userId: 5783,
  profile: [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4],
  movieHistory: {543:1, 155:1, 1234:1, 2345:1, 267563:1, 103234:1, 456:1, 23423:1, 78654:1, 1234:1, 2345:1, 64546:1, 87654:1, 235734:1, 298765:1}
}
*/
const eucDist = (p, q) => {
  const sqDiffs = [];
  for (let i = 0; i < p.length; i++) {
    sqDiffs.push((Number(p[i]) - Number(q[i])) ** 2);
  }
  return sqDiffs.reduce((a, b) => (a + b));
};

const getDists = (userData, cb) => {
  userData.profile = Array.isArray(userData.profile) ? userData.profile : JSON.parse(userData.profile);
  const distances = [];
  for (let i = 1; i <= 300000; i++) {
    redisClient.lrange(i, 0, -1, (err, res) => {
      if (err) {
        console.error('Error finding distance between user data and movie data', err);
        return;
      }
      distances.push([i, eucDist(userData.profile, res)]);
      if (i === 300000) {
        cb(distances.sort((a, b) => (a[1] - b[1]))
          .slice(0, 20)
          .map(movie => (movie[0])));
      }
    });
  }
};

module.exports = {
  getDists,
  eucDist
};
