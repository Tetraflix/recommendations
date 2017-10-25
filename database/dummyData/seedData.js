const ratioDB = require('../ratios/index.js');

const totalEvents = 1000000;

let createdAt = new Date('2017-07-14 15:37:42.997-07');
const incrementTime = date => (new Date(date.getTime() + 5000));

const generateUser = () => {
  const userId = Math.floor(Math.random() * (totalEvents / 10));
  let ratio = Math.random();
  while (ratio < 0.4) {
    ratio = Math.random();
  }
  return {
    groupId: userId % 2,
    userId,
    ratio,
    createdAt,
  };
};

const users = [];
for (let i = 0; i < totalEvents; i += 1) {
  createdAt = incrementTime(createdAt);
  users.push(generateUser());
}

// const averages = users.reduce((arr, user) => {
//   arr[user.groupId] = (user.ratio + arr[user.groupId]) / 2;
//   return arr;
// }, [0, 0]);
// const totals = [
//   { ratio: averages[0], groupId: 0 },
//   { ratio: averages[1], groupId: 1 }
// ];
const addRows = (tableName, array) => {
  console.log(new Date());
  return ratioDB[tableName].bulkCreate(array);
};


module.exports = () => (
  ratioDB.UserRatio.sync()
    .then(() => (ratioDB.TotalRatio.sync({ force: true })))
    .then(() => (addRows('UserRatio', users)))
    .then(() => (console.log(new Date())))
    // .then(() => (addRows('TotalRatio', totals)))
    .catch((err) => {
      console.log('Error adding dummy data', err);
    })
);
