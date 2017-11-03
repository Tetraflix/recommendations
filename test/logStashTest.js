const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
chai.use(chaiHttp);
const should = chai.should();
const movieDB = require('../database/movies/index.js');
const { eucDist } = require('../server/genRecs.js');
const { getDists } = require('../server/genRecs.js');
const { sqs } = require('../server/index.js')

describe('SQS', () => {
  it('should have a queue url for session data', (done) => {
    const params = { QueueName: 'tetraflix-session-data.fifo' };
    sqs.getQueueUrl(params, function(err, data) {
      if (err) console.log(err);
      data.should.exist;
      done();
    });
  });

  it('should have a queue url for user data', (done) => {
    const params = { QueueName: 'tetraflix-user-data.fifo' };
    sqs.getQueueUrl(params, function(err, data) {
      if (err) console.log(err);
      data.should.exist;
      done();
    });
  });

  it('should have a queue url for recommendations data', (done) => {
    const params = { QueueName: 'tetraflix-recommendations-data.fifo' };
    sqs.getQueueUrl(params, function(err, data) {
      if (err) console.log(err);
      data.should.exist;
      done();
    });
  });

});

describe('Generating Recommendations', () => {
  it('should correctly calculate the euclidean distance between two arrays (treated as vectors)', (done) => {
    const dist = eucDist([7, 5, 0, 10, 3, 7, 8, 16, 5, 14, 2, 6, 5, 3, 9],
      [9, 12, 11, 9, 6, 2, 2, 0, 3, 11, 8, 9, 8, 5, 5]);
    dist.should.equal(588);
    done();
  });

  it('should generate recommendations sorted by euclidean distance', (done) => {
    const userProf = [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4];
      getDists({
        userId: 5783,
        profile: [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4],
        movieHistory: {543:1, 155:1, 1234:1, 2345:1, 267563:1, 103234:1, 456:1, 23423:1, 78654:1, 1234:1, 2345:1, 64546:1, 87654:1, 235734:1, 298765:1}
      })
      .then((res) => {
        Array.isArray(res).should.equal(true);
        res.length.should.equal(20);
        let closest;
        movieDB.lrangeAsync(res[0], 0, -1)
          .then(movie => {
            closest = eucDist(userProf, movie);
            return movieDB.lrangeAsync(res[res.length - 1], 0, -1)
          })
          .then(lastMovie => {
            eucDist(userProf, lastMovie).should.be.above(closest);
            done();
          })
          .catch(err => (console.error('Error running test on recommendations', err)));
      });
  }).timeout(10000);
})
