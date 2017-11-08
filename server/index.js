const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
const winston = require('winston');
const rotator = require('stream-rotate');
const cron = require('node-cron');
const seedData = require('../database/dummyData/seedData');
const movieData = require('../database/dummyData/movieData');
const genRecs = require('./genRecs');
const sessionData = require('./sessionData');
require('../database/movies/index');
require('../database/ratios/index');
require('../database/dashboard/dashboardData');

const app = express();
const port = 3000;
AWS.config.loadFromPath(path.resolve(__dirname, '../credentials/aws.json'));
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queues = {
  session: 'https://sqs.us-east-2.amazonaws.com/938669920909/tetraflix-session-data.fifo',
  recommendations: 'https://sqs.us-east-2.amazonaws.com/938669920909/tetraflix-recommendations-data.fifo',
  user: 'https://sqs.us-east-2.amazonaws.com/938669920909/tetraflix-user-data.fifo',
};

const logStream = rotator({
  path: path.resolve(__dirname, '../logs'),
  name: 'log',
  freq: '1h',
});

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.File({ stream: logStream })],
});

const log = (data) => {
  logger.log({
    level: 'info',
    message: data,
  });
};

app.post('/dummydata', (req, res) => {
  seedData.genData(Number(req.query.entries))
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => (res.sendStatus(400)));
});

app.post('/moviedata', (req, res) => {
  movieData.genMovies()
    .then(() => res.sendStatus(201))
    .catch(err => console.error('Error posting dummy movie data', err));
});

const receiveMessages = options => (
  new Promise((resolve, reject) => {
    sqs.receiveMessage(options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
);

const deleteMessage = options => (
  new Promise((resolve, reject) => {
    sqs.deleteMessage(options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
);

const sendMessages = options => (
  new Promise((resolve, reject) => {
    sqs.sendMessage(options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
);

const sendMessageBatch = options => (
  new Promise((resolve, reject) => {
    sqs.sendMessageBatch(options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
);

const deleteBatch = options => (
  new Promise((resolve, reject) => {
    sqs.deleteMessageBatch(options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
);

const receiveSessionData = () => {
  let deleteId;
  const sessionOptions = {
    QueueUrl: queues.session,
    AttributeNames: ['All'],
  };
  receiveMessages(sessionOptions)
    .then((data) => {
      if (!data.Messages || !data.Messages[0]) {
        throw new Error('No Messages to Receive');
      }
      deleteId = data.Messages[0].ReceiptHandle;
      return sessionData(JSON.parse(data.Messages[0].Body));
    })
    .then(() => {
      log({ action: 'response sessiondata' });
      const deleteOptions = {
        QueueUrl: queues.session,
        ReceiptHandle: deleteId,
      };
      return deleteMessage(deleteOptions);
    })
    .catch(() => {
      log({ action: 'response sessiondata', error: true });
    });
};
cron.schedule('*/1 * * * * *', receiveSessionData);
cron.schedule('*/1 * * * * *', receiveSessionData);

const receiveUserData = () => {
  let deleteId;
  const userOptions = {
    QueueUrl: queues.user,
    AttributeNames: ['All'],
    MaxNumberOfMessages: 3,
  };
  receiveMessages(userOptions)
    .then((data) => {
      if (!data.Messages || !data.Messages[0]) {
        throw new Error('No Messages to Receive');
      }
      deleteId = data.Messages.map(msg => msg.ReceiptHandle);
      console.log('req made', data.Messages.length);
      return genRecs.getDists(data.Messages);
      // deleteId = data.Messages[0].ReceiptHandle;
      // return genRecs.getDists(JSON.parse(data.Messages[0].Body));
    })
    .then((recs) => {
      // const recOptions = {
      //   MessageBody: JSON.stringify(recs),
      //   QueueUrl: queues.recommendations,
      //   MessageGroupId: 'recommendations',
      // };
      // return sendMessageBatch(recOptions);
      console.log(recs);
    })
    .then(() => {
      // log({ action: 'response userdata' });
      // const deleteOptions = {
      //   QueueUrl: queues.user,
      //   ReceiptHandle: deleteId,
      // };
      // return deleteMessage(deleteOptions);
    })
    .catch(() => {
      log({ action: 'response userdata', error: true });
    });
};
cron.schedule('*/1 * * * * *', receiveUserData);
cron.schedule('*/1 * * * * *', receiveUserData);

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});

module.exports = {
  app,
  port,
  log,
  sqs,
  queues,
  sendMessages,
};

require('../liveData/sessionData.js');
require('../liveData/userData.js');
