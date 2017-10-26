const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const ratioDB = require('../database/ratios/index.js');

describe('Ratio Data', () => {
  beforeEach ((done) => {
    ratioDB.UserRatio.destroy({ where: {}, truncate: true })
      .then(() => done())
      .catch(err => (console.log('Error emptying UserRatio Table', err)));
  });

  describe('POST /dummydata', () => {
    it('should return the appropriate response', (done) => {
      chai.request('http://localhost:3000')
        .post('/dummydata?entries=1')
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should add an item to the user_ratios table and the total_ratios.table', (done) => {
      chai.request('http://localhost:3000')
        .post('/dummydata?entries=1')
        .end(() => {
          ratioDB.UserRatio.findAll()
            .then((results) => {
              results.length.should.equal(1);
            })
            .then(() => (ratioDB.TotalRatio.findAll()))
            .then((results) => {
              results.length.should.equal(1);
            })
            .then(() => done());
        });
    });
  });
});
