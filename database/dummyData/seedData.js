const ratioDB = require('../ratios/index.js');
const es = require('../dashboard/dashboardData.js');

let totalEvents;

let createdAt = new Date('2017-07-20 15:37:42.997-07');
const incrementTime = date => (new Date(date.getTime() + 10000));

const generateUser = (users, date) => {
  const userId = Math.floor(Math.random() * (users));
  let min = 0.2;
  if (userId % 2) {
    min = Math.min(0.7, ((date - new Date('2017-07-20 15:37:42.997-07')) / 10000000000));
  }
  let ratio = Math.random();
  while (ratio < min) {
    ratio = Math.random();
  }
  return {
    groupId: userId % 2,
    userId,
    ratio,
    date,
  };
};

const generateUsers = () => {
  const users = [[], []];
  for (let i = 1; i <= totalEvents; i += 1) {
    createdAt = incrementTime(createdAt);
    const elem = generateUser((totalEvents / 10), createdAt);
    users[0].push(elem);
    users[1].push({
      index: {
        _index: 'user-ratios',
        _type: 'user-ratio',
      },
    });
    users[1].push(elem);
  }
  return users;
};

const addRows = (tableName, array) => (
  ratioDB[tableName].bulkCreate(array)
);

const genDailyTotals = () => {
  const queryString = `SELECT "groupId",
    CAST("createdAt" AS DATE) AS Date,
    AVG(ratio) AS "avgRatio" FROM user_ratios
    GROUP BY CAST("createdAt" AS DATE),
    "groupId"`;
  return ratioDB.sequelize.query(queryString);
};

const genData = (num = 1000000) => {
  totalEvents = !num ? 1000000 : num;
  const users = generateUsers();
  console.log('finished generating users', new Date());
  return ratioDB.UserRatio.sync()
    .then(() => (ratioDB.TotalRatio.sync({ force: true })))
    .then(() => (addRows('UserRatio', users[0])))
    .then(() => (es.bulkAdd(users[1])))
    .then(() => (genDailyTotals()))
    .then(results => (addRows('TotalRatio', results[0])))
    .catch((err) => {
      console.log('Error adding dummy data', err);
    });
};

module.exports = {
  genData,
  generateUser,
};
