require('dotenv').config({ path: '/etc/default/tatry' });

const express = require('express');

const TATRY_PORT = process.env.TATRY_PORT || 3080;
const TATRY_DATA_PATH = process.env.TATRY_DATA_PATH || '/var/lib/tatry';

const app = express();

app.enable('trust proxy');
app.disable('x-powered-by');
app.set('query parser', 'simple');

const { v1 } = require('./lib/tatry')(TATRY_DATA_PATH);
app.use('/api/v1', v1);

module.exports = app;

if (!module.parent) {
  app.listen(TATRY_PORT);
  console.log('Listening on port', TATRY_PORT);
}
