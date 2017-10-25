const redisClient = require('../movies/index.js');

const genProfile = () => {
  const profile = [];
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const val = Math.floor(Math.random() * 100);
    sum += val;
    profile.push(val);
  }
  const ratio = 100 / sum;
  let newSum = 0;
  profile.forEach((val, i) => {
    const newVal = Math.floor(profile[i] * ratio);
    newSum += newVal;
    profile[i] = newVal;
  });
  profile.push(100 - newSum);
  return profile;
};

module.exports = (i = 0) => {
  redisClient.delAsync(i)
    .then(() => (redisClient.lpushAsync(i, ...genProfile())))
    .then(() => {
      if (i < 300000) {
        return module.exports(i + 1);
      }
      return i;
    })
    .catch((err) => {
      console.error('Error adding data to redisClient', err);
    });
};
