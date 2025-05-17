process.env.TATRY_DATA_PATH = `${__dirname}/fixtures/data`;

const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeFetch } = require('supertest-fetch');

const app = require('../');

const request = makeFetch(http.createServer(app));

test('tatry', async function (t) {
  await t.test('v1', async function (t) {
    await t.test('responds to get', async function () {
      await request('/api/v1/lookup?locations=40.483468,-106.827126|40.5,-106.1|40.8,-106.9')
        .expectHeader('Content-Type', 'application/json; charset=utf-8')
        .expectHeader('Content-Length', '187')
        .expectHeader('ETag', '"bb-om3Uf+cI6lz8xEaVNPn1nWf0fjw"')
        .expectHeader('Server-Timing', /total.+, lookup.+/)
        .expectStatus(200)
        .expectBody({
          results: [
            { latitude: 40.483468, longitude: -106.827126, elevation: 2082.5 },
            { latitude: 40.5, longitude: -106.1, elevation: 3065 },
            { latitude: 40.8, longitude: -106.9, elevation: 2474 }
          ]
        });
    });

    await t.test('responds with None-Modified if ETag matches', async function () {
      await request('/api/v1/lookup?locations=40.483468,-106.827126|40.5,-106.1|40.8,-106.9', {
        cache: 'no-cache', // HACK: fetch sets 'Cache-Control' to 'no-cache' otherwise
        headers: {
          'If-None-Match': '"bb-om3Uf+cI6lz8xEaVNPn1nWf0fjw"',
          Accept: 'application/json'
        }
      }).expectStatus(304);
    });

    await t.test('responds to post', async function () {
      const locations = [
        { latitude: 40.483468, longitude: -106.827126 },
        { latitude: 40.5, longitude: -106.1 },
        { latitude: 40.8, longitude: -106.9 }
      ];
      await request('/api/v1/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          locations
        })
      })
        .expectHeader('Content-Type', /json/)
        .expectStatus(200)
        .expectBody({
          results: [
            { latitude: 40.483468, longitude: -106.827126, elevation: 2082.5 },
            { latitude: 40.5, longitude: -106.1, elevation: 3065 },
            { latitude: 40.8, longitude: -106.9, elevation: 2474 }
          ]
        });
    });

    await t.test('responds to get with invalid coordinates', async function () {
      const response = await request('/api/v1/lookup?locations=10,10', {
        headers: {
          Accept: 'application/json'
        }
      })
        .expectHeader('Content-Type', /json/)
        .expectStatus(200)
        .json();
      assert.deepEqual(response.results, [{ longitude: 10, latitude: 10, elevation: -32768 }]);
    });
  });

  await t.test('v2', async function (t) {
    await t.test('responds to get', async function () {
      const response = await request('/api/v2/lookup?lls=-106.827126,40.483468|-106.1,40.5|-106.9,40.8', {
        headers: {
          Accept: 'application/json'
        }
      })
        .expectHeader('Content-Type', 'application/json; charset=utf-8')
        .expectHeader('Content-Length', '139')
        .expectHeader('ETag', '"8b-7qj+jGWXNhf1LTbAVypElfOgubc"')
        .expectHeader('Server-Timing', /total.+, lookup.+/)
        .expectStatus(200)
        .json();
      assert.deepEqual(response.results, [
        { ll: [-106.827126, 40.483468], elevation: 2082.5 },
        { ll: [-106.1, 40.5], elevation: 3065 },
        { ll: [-106.9, 40.8], elevation: 2474 }
      ]);
    });

    await t.test('responds with None-Modified if ETag matches', async function () {
      await request('/api/v2/lookup?lls=-106.827126,40.483468|-106.1,40.5|-106.9,40.8', {
        cache: 'no-cache', // HACK: fetch sets 'Cache-Control' to 'no-cache' otherwise
        headers: {
          'If-None-Match': '"8b-7qj+jGWXNhf1LTbAVypElfOgubc"',
          Accept: 'application/json'
        }
      }).expectStatus(304);
    });

    await t.test('responds to post', async function () {
      const response = await request('/api/v2/lookup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lls: [
            [-106.827126, 40.483468],
            [-106.1, 40.5],
            [-106.9, 40.8]
          ]
        })
      })
        .expectHeader('Content-Type', /json/)
        .expectStatus(200)
        .json();
      assert.deepEqual(response.results, [
        { ll: [-106.827126, 40.483468], elevation: 2082.5 },
        { ll: [-106.1, 40.5], elevation: 3065 },
        { ll: [-106.9, 40.8], elevation: 2474 }
      ]);
    });

    await t.test('responds to get with invalid coordinates', async function () {
      const response = await request('/api/v2/lookup?lls=10,10', {
        headers: {
          Accept: 'application/json'
        }
      })
        .expectHeader('Content-Type', /json/)
        .expectStatus(200)
        .json();
      assert.deepEqual(response.results, [
        {
          ll: [10, 10]
        }
      ]);
    });
  });
});
