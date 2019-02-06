const express = require('express');
const bodyParser = require('body-parser');

const makeMetas = require('./metas');
const makeFileBag = require('./file-bag');
const makeLookup = require('./lookup');

module.exports = tatry;

function fromQuery(req, res, next) {
  const { locations } = req.query;
  req.lls = locations.split('|').map(point => {
    const latlon = point.split(',').map(parseFloat);
    return [ latlon[1], latlon[0] ];
  });
  next();
}

function fromBody(req, res, next) {
  const { locations } = req.body;
  req.lls = locations.map(({ longitude, latitude }) => [ longitude, latitude ]);
  next();
}

function lookup(req, res, next) {
  const { lookup, lls } = req;

  lookup(lls).then(elevations => {
    const results = lls.map((ll, i) => {
      return {
        latitude: ll[1],
        longitude: ll[0],
        elevation: elevations[i]
      };
    });
    req.item = { results };
    next();
  }, next);

}

function send(req, res) {
  res.send(req.item);
}

function tatry(dataDir) {
  const v1 = express.Router({
    strict: true,
    caseSensitive: true
  });

  const pLookup = makeMetas(dataDir)
    .then(makeFileBag)
    .then(fileBag => makeLookup({ fileBag }));

  function setLookup(req, res, next) {
    pLookup.then(({ lookup }) => {
      req.lookup = lookup;
      next();
    }, next);
  }

  v1.use(bodyParser.json());
  v1.use(setLookup);
  v1.get('/lookup', fromQuery, lookup, send);
  v1.post('/lookup', fromBody, lookup, send);

  return {
    v1
  };
}
