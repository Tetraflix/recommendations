const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const movieDB = require('../database/movies/index.js');

xdescribe('Movie Data', () => {
  it('should create 300,000 entries', (done) => {
    chai.request('http://localhost:3000')
      .post('/movieData')
      .end(() => {
        movieDB.dbsize((err, res) => {
          res.should.equal(300000);
          done();
        });
      });
  }).timeout(60000);

  it('should contain appropriate movie genre list entries', (done) => {
    movieDB.lrangeAsync(1, 0, -1)
      .then((res) => {
        res.length.should.equal(15);
        res.reduce((a, b) => (Number(a) + Number(b))).should.equal(100);
        return movieDB.lrangeAsync(300000, 0, -1);
      })
      .then((res) => {
        res.length.should.equal(15);
        res.reduce((a, b) => (Number(a) + Number(b))).should.equal(100);
        done();
      })
      .catch((err) => console.error('Error testing movie entries', err));
  }).timeout(30000);
});
