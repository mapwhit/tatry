
1.0.7 / 2024-12-13
==================

 * upgrade router to ~2
 * soft dependency update

1.0.6 / 2024-09-11
==================

 * upgrade path-to-regexp to 0.1.10
 * upgrade lru-cache to ~11
 * upgrade supertest to ~7

1.0.5 / 2024-01-12
==================

 * upgrade lru-cache to ~10
 * replace `tape` with `node:test`

1.0.4 / 2022-06-04
==================

 * upgrade lru-cache to ~7
 * update dotenv to ~16
 * soft dependency upgrade
 * replace Travis CI with github actions

1.0.3 / 2021-07-06
==================

 * upgrade dotenv to ~10
 * upgrade supertest to ~6
 * upgrade lru-cache to ~6
 * upgrade tape to ~5
 * replace mocha with tape

1.0.2 / 2019-03-29
==================

 * upgrade supertest
 * replace connect with @pirxpilot/connect

1.0.1 / 2019-03-20
==================

 * re-implement ETag
 * replace express with connect and router

1.0.0 / 2019-02-18
==================

 * update documentation
 * make body limit configurable with `TATRY_BODY_LIMIT`
 * add cache-control header to API responses
 * deduplicate dependencies

0.3.3 / 2019-02-17
==================

 * allow '100mb' and similar as `TATRY_CACHE_SIZE`
 * replace rbush with flatbush

0.3.2 / 2019-02-17
==================

 * add support caching tiff tiles

0.3.1 / 2019-02-11
==================

 * fix readRaster for some edge cases
 * fix lookups for points on the edge
 * simplify lame-tiff readRaster with async/await
 * select best resolution data
 * filter out files that tatry cannot use

0.3.0 / 2019-02-10
==================

 * stop using geotiff module - use lame-tiff parser insted

0.2.3 / 2019-02-09
==================

 * use lame-tiff for reading pixels

0.2.2 / 2019-02-07
==================

 * fix typo in docs
 * skip elevation in response if we don't have it (v2 only)
 * never use `INVALID_ELEVATION` for interpolation

0.2.1 / 2019-02-07
==================

 * use geotiff with ESM
 * use internal version of readRasters

0.2.0 / 2019-02-07
==================

 * add support for v2 version of API

0.1.2 / 2019-02-07
==================

 * enable server-timings headers
 * adjust express defaults

0.1.1 / 2019-02-06
==================

 * add cluster config

0.1.0 / 2019-02-06
==================

 * initial implementation
