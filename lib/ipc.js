/* ================================================================
 * macaca-electron by xdf(xudafeng[at]126.com)
 *
 * first created at : Tue Mar 29 2016 09:11:49 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright  xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

'use strict';

const path = require('path');
const proc = require('child_process');
const electron_path = require('electron-prebuilt');
const errors = require('webdriver-dfn-error-code').errors;

const logger = require('./logger');
const runner = path.join(__dirname, 'runner.js');

function IPC(args) {
  this.proc = null;
  this.args = args;
}

IPC.prototype.initElectron = function*() {
  this.proc = proc.spawn(electron_path, [runner].concat(JSON.stringify(this.args)), {
    stdio: [0, 1, 2, 'ipc']
  });

  this.proc.on('close', code => {
    var help = {
      1: 'general error, you may need xvfb',
      0: 'success!'
    };

    logger[code ? 'error' : 'info'](`electron child process exited with: ${help[code] || code}`);
  });
};

IPC.prototype.stopElectron = function*() {
  this.proc && this.proc.kill();
};

IPC.prototype.send = function *(data) {
  return new Promise((resolve, reject) => {
    this.proc.send(data);
    const onMessage = (data) => {
      resolve(data);
    }
    this.proc.once('message', onMessage);
    setTimeout(() => {
      this.proc.removeListener('message', onMessage);
      reject(new errors.Timeout('Wait for message from the runner TIMEOUT.'));
    }, 5000);
  });
};

module.exports = IPC;
