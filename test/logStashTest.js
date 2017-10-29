const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
chai.use(chaiHttp);
const should = chai.should();
const movieDB = require('../database/movies/index.js');

describe('Logstash', () => {
  it('should accept post requests to "/userdata" and "/sessiondata"', (done) => {
    chai.request('http://localhost:3000')
      .post('/userdata')
      .end((err, res) => {
        res.status.should.equal(201);
        chai.request('http://localhost:3000')
          .post('/sessiondata')
          .end((err, res) => {
            res.status.should.equal(201);
            done();
          });
      });
    }).timeout(5000);
});
