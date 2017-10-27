const ElasticSearch = require('elasticsearch');
const ratioDB = require('../ratios/index.js');

const client = new ElasticSearch.Client({
  host: 'localhost:9200',
});

client.ping({ requestTimeout: 30000 }, (err) => {
  if (err) {
    console.error('elasticsearch cluster is down', err);
  } else {
    console.log('All is well with elasticsearch!');
  }
});

const addUser = (i, max) => (
  ratioDB.UserRatio.findById(i)
    .then((row) => {
      if (i <= max) {
        row = JSON.parse(JSON.stringify(row));
        const doc = {
          index: 'user-ratios',
          type: 'user-ratio',
          id: row.id.toString(),
          body: {
            ratio: Number(row.ratio),
            userId: row.userId,
            groupId: row.groupId,
            createdAt: row.createdAt,
          }
        };
        return client.create(doc);
      }
    })
    .then(() => (addUser(i + 1, max)))
    .catch(() => {
      if (i < max) {
        return addUser(i + 1, max);
      }
      return null;
    })
);

// ratioDB.sequelize.query(`SELECT count(*) AS exact_count FROM user_ratios`)
//   .then(res => (addUser(1, Number(res[0][0].exact_count))))
//   .catch(err => (console.log('Error adding data to elasticsearch', err)));


module.exports = {
  client,
  addUser,
};
