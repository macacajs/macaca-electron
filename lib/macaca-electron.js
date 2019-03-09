'use strict';

const co = require('co');
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

  * startDevice(caps) {
    const that = this;
    return new Promise((resolve, reject) => {
      co(function * () {
        that.args = _.clone(caps || {});
        that.ipc = that.ipc || new IPC(that.args);
        yield that.ipc.initElectron();
        yield _.sleep(3 * 1000);
        resolve();
      }).catch(reject);
    });
  }

  get runnerProcess() {
    return this.ipc && this.ipc.proc;
  }

  stopDevice() {
    const that = this;
    return new Promise((resolve, reject) => {
      co(function * () {
        yield that.ipc.stopElectron();
        that.ipc = null;
        resolve();
      }).catch(reject);
    });
  }

  isProxy() {
    return false;
  }

  whiteList(context) {
    var basename = path.basename(context.url);
    const whiteList = [];
    return !!~whiteList.indexOf(basename);
  }

  * send(data) {
    return yield this.ipc.send(data);
  }
}

_.extend(Electron.prototype, controllers);

module.exports = Electron;
