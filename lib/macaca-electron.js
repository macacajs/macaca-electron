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
const DriverBase = require('driver-base');

const IPC = require('./ipc');
const _ = require('./helper');
const controllers = require('./controllers');

class Electron extends DriverBase {

  constructor() {
    super();
    this.ipc = null;
    this.args = null;
    this.atoms = [];
  }

  *startDevice(caps) {
    this.args = _.clone(caps || {});
    this.ipc = this.ipc || new IPC(this.args);

    yield this.ipc.initElectron();
    yield _.sleep(3000);
  }

  *stopDevice() {
    yield this.ipc.stopElectron();
    this.ipc = null;
  }

  isProxy() {
    return false;
  }

  whiteList(context) {
    var basename = path.basename(context.url);
    const whiteList = [];
    return !!~whiteList.indexOf(basename);
  }

  *send(data) {
    return yield this.ipc.send(data);
  }
}

_.extend(Electron.prototype, controllers);

module.exports = Electron;
