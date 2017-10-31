const redisClient = require('../database/movies/index.js');

// ids start at 1 and end at 300,000
/*
USER DATA INPUT:
{
  userId: 534356757834,
  profile: {action: 33, comedy: 20, drama: 44, romance: 33,
    SF: 2, ...},
  movieHistory: [543, 155, ...]
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
};
