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

const addUser = (row) => {
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
};

const bulkAdd = arr => (
  client.bulk({
    body: arr,
  })
);


module.exports = {
  client,
  addUser,
  bulkAdd,
};
