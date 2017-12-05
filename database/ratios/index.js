const Sequelize = require('sequelize');
const credentials = require('../../credentials/postgres.js');

const host = 'localhost';

const sequelize = new Sequelize('ratios', credentials.username, credentials.password, {
  host,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

sequelize.authenticate()
  .then(() => {
    console.log('Succesfully connected to Sequelize!');
  })
  .catch((err) => {
    console.error('Error connecting Sequelize', err);
  });

const UserRatio = sequelize.define('user_ratio', {
  ratio: Sequelize.DECIMAL,
  userId: Sequelize.INTEGER,
  groupId: Sequelize.INTEGER,
});

const TotalRatio = sequelize.define('total_ratio', {
  ratio: Sequelize.DECIMAL,
  groupId: Sequelize.INTEGER,
});

UserRatio.sync()
  .then(() => {
    TotalRatio.sync();
  })
  .catch((err) => {
    console.error('Error syncing tables', err);
  });

module.exports = {
  sequelize,
  UserRatio,
  TotalRatio,
};
