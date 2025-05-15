const Router = require('router');
const bodyParser = require('body-parser');
const querystring = require('node:querystring');
const parseurl = require('parseurl');
const isFresh = require('fresh');
const calculateEtag = require('etag');

const makeMetas = require('./metas');
const makeFileBag = require('./file-bag');
const makeLookup = require('./lookup');

const { INVALID_ELEVATION } = require('./interpolate');

module.exports = tatry;

// V1 support - points as { latitude, longitude }
function fromQueryLocations(req, _res, next) {
  const { locations } = req.query;
  req.lls = locations.split('|').map(point => {
    const latlon = point.split(',').map(Number.parseFloat);
    return [latlon[1], latlon[0]];
  });
  next();
}

function fromBodyLocations(req, _res, next) {
  const { locations } = req.body;
  req.lls = locations.map(({ longitude, latitude }) => [longitude, latitude]);
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
function fromQueryLls(req, _res, next) {
  const { lls } = req.query;
  req.lls = lls.split('|').map(point => point.split(',').map(Number.parseFloat));
  next();
}

function fromBodyLls(req, _res, next) {
  const { lls = [] } = req.body;
  req.lls = lls;
  next();
}

function collateResultsLls(lls, elevations) {
  return lls.map((ll, i) => (elevations[i] !== INVALID_ELEVATION ? { ll, elevation: elevations[i] } : { ll }));
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

function cacheControl(_req, res, next) {
  // good for a week
  res.setHeader('Cache-Control', 'public, max-age=604800');
  next();
}

function send(req, res) {
  const data = Buffer.from(JSON.stringify(req.item));
  const len = data.byteLength;
  const etag = calculateEtag(data);

  if (isFresh(req.headers, { etag })) {
    // respond with 304...
    res.statusCode = 304;
    return res.end();
  }

  // normal response
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', len);
  res.setHeader('ETag', etag);
  return res.end(data);
}

function makeRouter({ setLookup, collateResults, fromQuery, fromBody }) {
  const router = new Router({
    strict: true,
    caseSensitive: true
  });

  function setCollate(req, _res, next) {
    req.collateResults = collateResults;
    next();
  }

  function parseQuery(req, _res, next) {
    const { query } = parseurl(req);
    req.query = querystring.parse(query);
    next();
  }

  const parseBody = bodyParser.json({
    limit: process.env.TATRY_BODY_LIMIT || '250kb'
  });

  router.use(setLookup);
  router.use(setCollate);
  router.get('/lookup', parseQuery, fromQuery, lookup, cacheControl, send);
  router.post('/lookup', parseBody, fromBody, lookup, send);

  return router;
}

function tatry(dataDir) {
  const pLookup = makeMetas(dataDir)
    .then(makeFileBag)
    .then(fileBag => makeLookup({ fileBag }));

  function setLookup(req, _res, next) {
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
