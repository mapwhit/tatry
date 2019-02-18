
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
