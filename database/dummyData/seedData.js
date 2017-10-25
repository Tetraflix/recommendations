const ratioDB = require('../ratios/index.js');

const users = [
  {
    ratio: 0.63443, userId: 123434, groupId: 0, createdAt: '2016-10-20 15:37:42.997-07'
  },
  { ratio: 0.54323, userId: 2346545, groupId: 1 },
  { ratio: 0.87442, userId: 13346, groupId: 1 },
  { ratio: 0.78493, userId: 734234, groupId: 0 },
  { ratio: 0.64589, userId: 123434, groupId: 0 },
  { ratio: 0.96705, userId: 2346545, groupId: 1 },
  { ratio: 0.87000, userId: 13346, groupId: 0 },
  { ratio: 0.75896, userId: 734234, groupId: 1 },
];
const averages = users.reduce((arr, user) => {
  arr[user.groupId] = (user.ratio + arr[user.groupId]) / 2;
  return arr;
}, [0, 0]);
const totals = [
  { ratio: averages[0], groupId: 0 },
  { ratio: averages[1], groupId: 1 }
];
const addRows = (tableName, array) => (
  ratioDB[tableName].bulkCreate(array)
);


module.exports = () => (
  ratioDB.UserRatio.sync({ force: true })
    .then(() => (ratioDB.UserRatio.sync({ force: true })))
    .then(() => (addRows('UserRatio', users)))
    .then(() => (addRows('TotalRatio', totals)))
    .catch((err) => {
      console.log('Error adding dummy data', err);
    })
);
