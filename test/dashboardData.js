const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

describe('Elastic Search', () => {
  it('should be connected to elasticsearch', (done) => {
    chai.request('http://localhost:9200')
      .get('/')
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.cluster_name.should.equal('elasticsearch');
        done();
      });
  }).timeout(5000);

  it('should return valid results when index user-ratios is searched', (done) => {
    chai.request('http://localhost:9200')
      .get('/user-ratios/user-ratio/_search')
      .end((err, res) => {
        res.body.should.have.property('took');
        res.body.should.have.property('timed_out');
        res.body.should.have.property('_shards');
        res.body.should.have.property('hits');
        res.body.hits.should.have.property('hits');
        res.status.should.equal(200);
        done();
      });
  }).timeout(5000);
});
