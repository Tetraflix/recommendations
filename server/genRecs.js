const redisClient = require('../database/movies/index.js');
const timsort = require('timsort');

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

// const manyEucDist = (users, q) => (
//   users.map((user) => (eucDist(user.profile, q)));
// );

// const getDists = (userData) => (
//   new Promise((resolve, reject) => {
//     userData.profile = Array.isArray(userData.profile) ? userData.profile : JSON.parse(userData.profile);
//     const distances = [];
//     for (let i = 1; i <= 300000; i++) {
//       redisClient.lrange(i, 0, -1, (err, res) => {
//         if (err) {
//           console.error('Error finding distance between user data and movie data', err);
//           reject(error);
//         } else {
//           distances.push([i, eucDist(userData.profile, res)]);
//           if (i === 300000) {
//             timsort.sort(distances, (a, b) => (a[1] - b[1]));
//             resolve(distances.slice(0, 20).map(movie => (movie[0])));
//           }
//         }
//       });
//     }
//   })
// );

// const getDists = (userData) => {
//     console.log(userData.profile);
//     userData.profile = Array.isArray(userData.profile) ? userData.profile : JSON.parse(userData.profile);
//     const distances = [];
//     for (let i = 1; i <= 300000; i++) {
//       distances.push(redisClient.lrangeAsync(i, 0, -1).then((res) => ([i, eucDist(userData.profile, res)])));
//     }
//     return Promise.all(distances)
//       .then((dists) => {
//         timsort.sort(dists, (a, b) => (a[1] - b[1]));
//         return dists.slice(0, 20).map(movie => (movie[0]));
//       });
// };
//
// const genArray = (messages) => (
//   Promise.all(messages.map((user, i) => (
//     getDists(JSON.parse(user.Body))
//       .then(recs => {
//         console.log(recs);
//         return {
//           id: i.toString(),
//           MessageBody: JSON.stringify(recs),
//           MessageGroupId: 'recommendations',
//         }
//       })
//   )))
// );

const getDists = (messages) => {
  const users = messages.map(user => (JSON.parse(user.Body)));
  const storage = {};
  const distances = [];
  for (let i = 1; i <= 300000; i++) {
    distances.push(
      redisClient.lrangeAsync(i, 0, -1)
        .then((res) => {
          users.forEach((user) => {
            if (!storage[user.movieHistory[i]]) {
              storage[user.userId] ?
                storage[user.userId].push([i, eucDist(user.profile, res)]) :
                storage[user.userId] = [[i, eucDist(user.profile, res)]];
            }
          });
        })
    );
  }
  return Promise.all(distances)
    .then(() => {
      for (let key in storage) {
        timsort.sort(storage[key], (a, b) => (a[1] - b[1]));
        return storage[key].slice(0, 20).map(movie => (movie[0]));
      }
    });
};

module.exports = {
  getDists,
  eucDist
};
