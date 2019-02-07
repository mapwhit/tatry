#!/usr/bin/env node

require('dotenv').config({ path: '/etc/default/tatry' });

const cluster = require('cluster');
const debug = require('debug')('tatry:cluster');

if (cluster.isMaster) {

  cluster.setupMaster({
    exec: 'index.js'
  });
  cluster.on('listening', function(worker, { address, port }) {
    debug(`worker ${worker.process.pid} is now connected to ${address}:${port}`);
  });
  cluster.on('exit', function(worker) {
    let { process: { pid, exitCode } } = worker;
    debug(`worker ${pid} died ('${exitCode}'). restarting...`);
    cluster.fork();
  });

  let workers = process.env.TATRY_WORKERS || 2;
  while(workers--) {
    cluster.fork();
  }
}
