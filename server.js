#!/usr/bin/env node

import './lib/env.js';

import cluster from 'node:cluster';
import Debug from 'debug';

const debug = Debug('tatry:cluster');

if (cluster.isPrimary) {
  cluster.setupPrimary({
    exec: 'index.js'
  });
  cluster.on('listening', (worker, { address, port }) => {
    debug(`worker ${worker.process.pid} is now connected to ${address}:${port}`);
  });
  cluster.on('exit', worker => {
    const {
      process: { pid, exitCode }
    } = worker;
    debug(`worker ${pid} died ('${exitCode}'). restarting...`);
    cluster.fork();
  });

  let workers = process.env.TATRY_WORKERS || 2;
  while (workers--) {
    cluster.fork();
  }
}
