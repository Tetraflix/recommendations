const ElasticSearch = require('elasticsearch');

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

const addDoc = (index, type, body) => {
  const doc = {
    index,
    type,
    body,
  };
  return client.index(doc);
};

const bulkAdd = arr => (
  client.bulk({
    body: arr,
  })
);


module.exports = {
  client,
  addDoc,
  bulkAdd,
};
