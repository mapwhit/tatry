import querystring from 'node:querystring';
import { json } from 'node:stream/consumers';
import Router from '@pirxpilot/router';
import calculateEtag from 'etag';
import isFresh from 'fresh';
import parseurl from 'parseurl';
import makeFileBag from './file-bag.js';
import { INVALID_ELEVATION } from './interpolate.js';
import makeLookup from './lookup.js';
import makeMetas from './metas.js';

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

  router.use(setLookup);
  router.use(setCollate);
  router.get('/lookup', parseQuery, fromQuery, lookup, cacheControl, send);
  router.post('/lookup', parseBody, fromBody, lookup, send);

  return router;

  function setCollate(req, _res, next) {
    req.collateResults = collateResults;
    next();
  }

  function parseQuery(req, _res, next) {
    const { query } = parseurl(req);
    req.query = querystring.parse(query);
    next();
  }

  async function parseBody(req, _res, next) {
    req.body = await json(req);
    next();
  }
}

export default function tatry(dataDir) {
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
