const express = require('express');
const bodyParser = require('body-parser');

const makeMetas = require('./metas');
const makeFileBag = require('./file-bag');
const makeLookup = require('./lookup');

const { INVALID_ELEVATION } = require('./interpolate');

module.exports = tatry;

// V1 support - points as { latitude, longitude }
function fromQueryLocations(req, res, next) {
  const { locations } = req.query;
  req.lls = locations.split('|').map(point => {
    const latlon = point.split(',').map(parseFloat);
    return [ latlon[1], latlon[0] ];
  });
  next();
}

function fromBodyLocations(req, res, next) {
  const { locations } = req.body;
  req.lls = locations.map(({ longitude, latitude }) => [ longitude, latitude ]);
  next();
}

function collateResultsLocations(lls, elevations) {
  return lls.map((ll, i) => ({
    latitude: ll[1],
    longitude: ll[0],
    elevation: elevations[i]
  }));
}

// V2 support - points as [ longitude, latitude ]
function fromQueryLls(req, res, next) {
  const { lls } = req.query;
  req.lls = lls.split('|').map(point => point.split(',').map(parseFloat));
  next();
}

function fromBodyLls(req, res, next) {
  const { lls = [] } = req.body;
  req.lls = lls;
  next();
}

function collateResultsLls(lls, elevations) {
  return lls.map((ll, i) => elevations[i] !== INVALID_ELEVATION ?
    { ll, elevation: elevations[i] } :
    { ll }
  );
}

function lookup(req, res, next) {
  const { timings } = res.locals;
  const { lookup, lls } = req;

  timings.start('lookup');

  lookup(lls).then(elevations => {
    req.item = {
      results: req.collateResults(lls, elevations)
    };
    timings.end('lookup');
    next();
  }, next);

}

function cacheControl(req, res, next) {
  // good for a week
  res.header('Cache-Control', 'public, max-age=604800');
  next();
}

function send(req, res) {
  res.send(req.item);
}

function makeRouter({ setLookup, collateResults, fromQuery, fromBody }) {
  const router = express.Router({
    strict: true,
    caseSensitive: true
  });


  function setCollate(req, res, next) {
    req.collateResults = collateResults;
    next();
  }

  router.use(bodyParser.json());
  router.use(setLookup);
  router.use(setCollate);
  router.get('/lookup', fromQuery, lookup, cacheControl, send);
  router.post('/lookup', fromBody, lookup, send);

  return router;
}

function tatry(dataDir) {
  const pLookup = makeMetas(dataDir)
    .then(makeFileBag)
    .then(fileBag => makeLookup({ fileBag }));

  function setLookup(req, res, next) {
    pLookup.then(({ lookup }) => {
      req.lookup = lookup;
      next();
    }, next);
  }

  return {
    v1: makeRouter({
      setLookup,
      collateResults: collateResultsLocations,
      fromQuery: fromQueryLocations,
      fromBody: fromBodyLocations
    }),
    v2: makeRouter({
      setLookup,
      collateResults: collateResultsLls,
      fromQuery: fromQueryLls,
      fromBody: fromBodyLls
    })
  };
}
