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

  async startDevice(caps) {
    this.args = _.clone(caps || {});
    this.ipc = this.ipc || new IPC(this.args);
    await this.ipc.initElectron();
    await _.sleep(3 * 1000);
  }

  get runnerProcess() {
    return this.ipc && this.ipc.proc;
  }

  async stopDevice() {
    await this.ipc.stopElectron();
    this.ipc = null;
  }

  isProxy() {
    return false;
  }

  whiteList(context) {
    const basename = path.basename(context.url);
    const whiteList = [];
    return !!~whiteList.indexOf(basename);
  }

  async send(data) {
    return await this.ipc.send(data);
  }
}

_.extend(Electron.prototype, controllers);

module.exports = Electron;
