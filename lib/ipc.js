'use strict';

const path = require('path');
const proc = require('child_process');
const electron_path = require('electron');
const { errors } = require('webdriver-dfn-error-code');

const logger = require('./logger');
const runner = path.join(__dirname, 'runner.js');

function IPC(args) {
  this.proc = null;
  this.args = args;
}

IPC.prototype.initElectron = async function() {
  this.proc = proc.spawn(
    electron_path,
    [runner, '--no-sandbox'].concat(JSON.stringify(this.args)),
    {
      stdio: [0, 1, 2, 'ipc']
    }
  );

  this.proc.once('close', code => {
    const help = {
      1: 'general error, you may need xvfb',
      0: 'success!'
    };
    logger[code ? 'warn' : 'debug'](
      `electron child process exited with: ${help[code] || code}`
    );
  });
};

IPC.prototype.stopElectron = async function() {
  this.proc && this.proc.kill();
};

IPC.prototype.send = async function(data) {
  return new Promise((resolve, reject) => {
    try {
      this.proc.send(data);
    } catch (e) {
      console.log(e.stack);
      console.log('some problem with xvfb or the size of window');
      reject(new errors.UnknownError(e.message));
    }
    const timer = setTimeout(() => {
      reject(new errors.Timeout('Wait for message from the runner TIMEOUT.'));
    }, 60 * 1000);

    this.proc.once('exit', code => {
      resolve({ status: code });
      clearTimeout(timer);
    });

    this.proc.once('message', data => {
      resolve(data);
      clearTimeout(timer);
    });
  });
};

module.exports = IPC;
