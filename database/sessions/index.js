const Sequelize = require('sequelize');
const credentials = require('./credentials.js');

const sequelize = new Sequelize('ratios', credentials.username, credentials.password, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

sequelize.authenticate()
  .then(() => {
    console.log('Succesfully connected to Sequelize!');
  })
  .catch((err) => {
    console.error('Error connecting Sequelize', err);
  });

module.exports = sequelize;
