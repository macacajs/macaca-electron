'use strict';

const path = require('path');
const proc = require('child_process');
const electron_path = require('electron');
const errors = require('webdriver-dfn-error-code').errors;

const logger = require('./logger');
const runner = path.join(__dirname, 'runner.js');

function IPC(args) {
  this.proc = null;
  this.args = args;
}

IPC.prototype.initElectron = function *() {
  this.proc = proc.spawn(electron_path, [runner].concat(JSON.stringify(this.args)), {
    stdio: [0, 1, 2, 'ipc']
  });

  this.proc.once('close', code => {
    const help = {
      1: 'general error, you may need xvfb',
      0: 'success!'
    };
    logger[code ? 'warn' : 'debug'](`electron child process exited with: ${help[code] || code}`);
  });
};

IPC.prototype.stopElectron = function *() {
  this.proc && this.proc.kill();
};

IPC.prototype.send = function *(data) {
  return new Promise((resolve, reject) => {
    this.proc.send(data);
    const timer = setTimeout(() => {
      reject(new errors.Timeout('Wait for message from the runner TIMEOUT.'));
    }, 60 * 1000);

    this.proc.once('message', data => {
      resolve(data);
      clearTimeout(timer);
    });
  });
};

module.exports = IPC;
