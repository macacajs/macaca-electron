'use strict';

const path = require('path');
const DriverBase = require('driver-base');

const IPC = require('./ipc');
const _ = require('./helper');
const controllers = require('./controllers');

_.sudoUserPermissionDenied();

class Electron extends DriverBase {

  constructor() {
    super();
    this.ipc = null;
    this.args = null;
    this.frame = null;
    this.atoms = [];
  }

  *startDevice(caps) {
    this.args = _.clone(caps || {});
    this.ipc = this.ipc || new IPC(this.args);
    yield this.ipc.initElectron();
    yield _.sleep(3 * 1000);
  }

  get runnerProcess() {
    return this.ipc && this.ipc.proc;
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
