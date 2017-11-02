const request = require('request');
const cron = require('node-cron');
const app = require('../server/index.js');
const { generateUser } = require('../database/dummyData/seedData.js');

const genQuery = () => {
  const initialObj = generateUser(1000000, new Date());
  const moviesWatched = Math.random() * 5;
  initialObj.recs = moviesWatched * initialObj.ratio;
  initialObj.nonRecs = moviesWatched - initialObj.recs;
  delete initialObj.ratio;
  return initialObj;
};

const genOptions = () => ({
  MessageBody: JSON.stringify(genQuery()),
  QueueUrl: app.queues.session,
  MessageGroupId: 'session',
});

const sendMsg = (options) => {
  app.sendMessages(options)
    .then(() => app.log({ action: 'request sessiondata' }))
    .catch(() => app.log({ action: 'request sessiondata', error: true }));
};

cron.schedule('*/2 * * * * *', () => (sendMsg(genOptions())));
