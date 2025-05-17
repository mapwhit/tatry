[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# tatry

Fast and simple Elevation API server.

## Install

```sh
$ npm --global install tatry
```

`tatry` requires dataset to work. Please refer to [open-elevation] project on how to download and prepare the dataset.
`tatry` only works with regular TIFF files, uncompressed with elevation data kept as Int32 pixels.

You can use `gdal_translate` to convert your data.

```sh
# to decompress TIFF
gdal_translate -co "COMPRESS=none" in.tif out.tif

# to convert data to Int16 per pixel
gdal_translate -ot Int16 -strict in.tif out.tif
```

You may need to [split large][split-tiles] (>4GB) files into smaller parts since `tatry` does not support BigTIFF file format.

Data does not have to cover contiguous area. Where `tatry` finds a point that is represented by multimple tiles it will attempt to use the highest resolution data. Results are automatically interpolated using [bilinear interpolation].

## Configuration

The following environment variables can be specified:

- `TATRY_PORT` - port on which server listens - defaults to 3080
- `TATRY_DATA_PATH` - location of `.tif` files - defaults to `/var/lib/tatry`
- `TATRY_WORKERS` - number of workers threads - defaults to 2
- `TATRY_CACHE_SIZE` - size of the .tif tile cache, the bigger it is the more .tif info will be kept in memory - defaults to 100mb

`tatry` will initialize its environment from `/etc/default/tatry` file

## API

### V2

#### GET `/api/v2/lookup?lls=lon_1,lat_1|lon_2,lat_2`

Looks up elevation for one or more points. Each point is specified as `longitude,latitude` pair (think `x,y`).
Points are separated with `|`.

Example:

    /api/v2/lookup?lls=-160,30|100,-45

Result is return as JSON and contains a single `results` property which is an array of `{ ll, elevation }` tuples.

```json
{
  "results": [
    {
      "ll": [ -160, 30 ],
      "elevation": 100
    },
    {
      "ll": [ 100, -45 ],
      "elevation": -3.5
    }
  ]
}
```

#### POST `/api/v2/lookup`

Looks up elevation for one or more points. Parameters are sent in JSON body. `lls` parameter contains an array
of `longitude,latitude` pairs.

```json
{
  "lls": [
    [ -160, 30 ],
    [ 100, -45 ]
  ]
}
```

Result is the same as `GET` request result.

### V1

V1 API is compatible with [open-elevation] API - click for [details][open-elevation-api]

## Acknowledgments

Big thank you to [João Ricardo Lourenço](https://github.com/Jorl17) A.K.A @Jorl17  and [@Developer66](https://github.com/Developer66) for their work on [open-elevation] project.

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[split-tiles]: https://github.com/mapbox/gdal-polygonize-test/blob/master/split.sh
[bilinear interpolation]: https://en.wikipedia.org/wiki/Bilinear_interpolation

[open-elevation]: https://github.com/Jorl17/open-elevation
[open-elevation-api]: https://github.com/Jorl17/open-elevation/blob/master/docs/api.md

[npm-image]: https://img.shields.io/npm/v/tatry
[npm-url]: https://npmjs.org/package/tatry

[build-url]: https://github.com/mapwhit/tatry/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/mapwhit/tatry/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/tatry
[deps-url]: https://libraries.io/npm/tatry

