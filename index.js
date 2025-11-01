import './lib/env.js';

import { createServer } from 'node:http';
import connect from '@pirxpilot/connect';
import timings from '@pirxpilot/server-timings';
import tatry from './lib/tatry.js';

const TATRY_PORT = process.env.TATRY_PORT || 3080;
const TATRY_DATA_PATH = process.env.TATRY_DATA_PATH || '/var/lib/tatry';

const app = connect();
export default app;

app.use(function (_req, res, next) {
  res.locals = {};
  next();
});
app.use(timings);

const { v2, v1 } = tatry(TATRY_DATA_PATH);
app.use('/api/v2', v2);
app.use('/api/v1', v1);

if (import.meta.main) {
  createServer(app).listen(TATRY_PORT);
  console.log('Listening on port', TATRY_PORT);
}
