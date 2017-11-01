const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
chai.use(chaiHttp);
const should = chai.should();
const movieDB = require('../database/movies/index.js');
const { eucDist } = require('../server/genRecs.js');

describe('Live Data', () => {
  it('should reject post requests to "/userdata" and "/sessiondata" if no query is provided', (done) => {
    chai.request('http://localhost:3000')
      .post('/userdata')
      .end((err, res) => {
        res.status.should.equal(400);
        chai.request('http://localhost:3000')
          .post('/sessiondata')
          .end((err, res) => {
            res.status.should.equal(400);
            done();
          });
      });
    }).timeout(5000);

    it('should return an array of movies in response to a post request to "/userData"', (done) => {
      const userProf = [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4];
      chai.request('http://localhost:3000')
        .post('/userdata')
        .send({
          userId: 5783,
          profile: [4, 4, 15, 2, 0, 6, 16, 2, 13, 18, 6, 4, 5, 1, 4],
          movieHistory: {543:1, 155:1, 1234:1, 2345:1, 267563:1, 103234:1, 456:1, 23423:1, 78654:1, 1234:1, 2345:1, 64546:1, 87654:1, 235734:1, 298765:1}
        })
        .end((err, results) => {
          const res = results.body;
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
});
