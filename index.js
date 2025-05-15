require('dotenv').config({ path: '/etc/default/tatry' });

const connect = require('@pirxpilot/connect');
const timings = require('server-timings');

const TATRY_PORT = process.env.TATRY_PORT || 3080;
const TATRY_DATA_PATH = process.env.TATRY_DATA_PATH || '/var/lib/tatry';

const app = connect();

app.use(function (_req, res, next) {
  res.locals = {};
  next();
});
app.use(timings);

const { v2, v1 } = require('./lib/tatry')(TATRY_DATA_PATH);
app.use('/api/v2', v2);
app.use('/api/v1', v1);

module.exports = app;

if (!module.parent) {
  const { createServer } = require('node:http');
  createServer(app).listen(TATRY_PORT);
  console.log('Listening on port', TATRY_PORT);
}
