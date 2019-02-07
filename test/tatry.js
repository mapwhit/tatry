process.env.TATRY_DATA_PATH = __dirname + '/fixtures/data';

const request = require('supertest');

const app = require('../');

describe('tatry', function () {

  context('v1', function() {
    it('responds to get', function () {
      return request(app)
        .get('/api/v1/lookup')
        .query({ locations: '40.483468,-106.827126|40.5,-106.1|40.8,-106.9' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.have.property('results', [
          { latitude: 40.483468, longitude: -106.827126, elevation: 2082.5 },
          { latitude: 40.5, longitude: -106.1, elevation: 3065 },
          { latitude: 40.8, longitude: -106.9, elevation: 2474 }
        ]));
    });

    it('responds to post', function () {
      return request(app)
        .post('/api/v1/lookup')
        .send({ locations: [
          { latitude: 40.483468, longitude: -106.827126 },
          { latitude: 40.5, longitude: -106.1 },
          { latitude: 40.8, longitude: -106.9 }
        ]})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.have.property('results', [
          { latitude: 40.483468, longitude: -106.827126, elevation: 2082.5 },
          { latitude: 40.5, longitude: -106.1, elevation: 3065 },
          { latitude: 40.8, longitude: -106.9, elevation: 2474 }
        ]));
    });

    it('responds to get with invalid coordinates', function () {
      return request(app)
        .get('/api/v1/lookup')
        .query({ locations: '10,10' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.eql({
          results: [{
            longitude: 10,
            latitude: 10,
            elevation: -32768
          }]
        }));
    });
  });

  context('v2', function() {

    it('responds to get', function () {
      return request(app)
        .get('/api/v2/lookup')
        .query({ lls: '-106.827126,40.483468|-106.1,40.5|-106.9,40.8' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.have.property('results', [
          { ll: [ -106.827126, 40.483468 ], elevation: 2082.5 },
          { ll: [ -106.1, 40.5 ], elevation: 3065 },
          { ll: [ -106.9, 40.8 ], elevation: 2474 }
        ]));
    });

    it('responds to post', function () {
      return request(app)
        .post('/api/v2/lookup')
        .send({ lls: [
          [ -106.827126, 40.483468 ],
          [ -106.1, 40.5 ],
          [ -106.9, 40.8 ]
        ]})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.have.property('results', [
          { ll: [ -106.827126, 40.483468 ], elevation: 2082.5 },
          { ll: [ -106.1, 40.5 ], elevation: 3065 },
          { ll: [ -106.9, 40.8 ], elevation: 2474 }
        ]));
    });

    it('responds to get with invalid coordinates', function () {
      return request(app)
        .get('/api/v2/lookup')
        .query({ lls: '10,10' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => response.body.should.eql({
          results: [{
            ll: [ 10, 10 ],
            elevation: -32768
          }]
        }));
    });
  });

});
