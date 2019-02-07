[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
[![Dev Dependency Status][deps-dev-image]][deps-dev-url]

# tatry

Elevation API server.

## Install

```sh
$ npm --global install tatry
```

`tatry` requires dataset to work. Please refer to [open-elevation] project on how to download and prepare the dataset.


## Configuration

The following environment variables can be specified:

- `TATRY_PORT` - port on which server listens - defaults to 3080
- `TATRY_DATA_PATH` - location of `.tif` files - defaults to `/var/lib/tatry`
- `TATRY_WORKERS` - number of workers threads - defaults to 2

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

[open-elevation]: https://github.com/Jorl17/open-elevation
[open-elevation-api]: https://github.com/Jorl17/open-elevation/blob/master/docs/api.md

[npm-image]: https://img.shields.io/npm/v/tatry.svg
[npm-url]: https://npmjs.org/package/tatry

[travis-url]: https://travis-ci.com/mapwhit/tatry
[travis-image]: https://img.shields.io/travis/com/mapwhit/tatry.svg

[deps-image]: https://img.shields.io/david/mapwhit/tatry.svg
[deps-url]: https://david-dm.org/mapwhit/tatry

[deps-dev-image]: https://img.shields.io/david/dev/mapwhit/tatry.svg
[deps-dev-url]: https://david-dm.org/mapwhit/tatry?type=dev

