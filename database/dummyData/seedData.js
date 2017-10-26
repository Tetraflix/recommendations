const ratioDB = require('../ratios/index.js');

let totalEvents;

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


const generateUsers = () => {
  const users = [];
  for (let i = 1; i <= totalEvents; i += 1) {
    createdAt = incrementTime(createdAt);
    users.push(generateUser());
  }
  return users;
};

const addRows = (tableName, array) => (
  ratioDB[tableName].bulkCreate(array)
);

const genDailyTotals = () => {
  const queryString = `SELECT "groupId",
    CAST("createdAt" AS DATE) AS DateField,
    AVG(ratio) FROM user_ratios
    GROUP BY CAST("createdAt" AS DATE),
    "groupId"`;
  return ratioDB.sequelize.query(queryString);
};

module.exports = (num = 1000000) => {
  totalEvents = num;
  const users = generateUsers();
  return ratioDB.UserRatio.sync()
    .then(() => (ratioDB.TotalRatio.sync({ force: true })))
    .then(() => (addRows('UserRatio', users)))
    .then(() => (genDailyTotals()))
    .then(results => (addRows('TotalRatio', results[0])))
    .catch((err) => {
      console.log('Error adding dummy data', err);
    });
};
