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
    const args = Array.prototype.slice.call(arguments);
    const promise = new Promise((resolve, reject) => {
      co(function * () {
        that.args = _.clone(caps || {});
        that.ipc = that.ipc || new IPC(that.args);
        yield that.ipc.initElectron();
        yield _.sleep(3 * 1000);
        resolve();
      }).catch(reject);
    });

    if (args.length > 1) {
      const cb = args[1];

      return promise
        .then(data => {
          cb.call(this, null, data);
        })
        .catch(err => {
          cb.call(this, `MacacaElectron error with: ${err}`);
        });
    } else {
      return promise;
    }
  }

  get runnerProcess() {
    return this.ipc && this.ipc.proc;
  }

  stopDevice() {
    const that = this;
    const args = Array.prototype.slice.call(arguments);
    const promise = new Promise((resolve, reject) => {
      co(function * () {
        yield that.ipc.stopElectron();
        that.ipc = null;
        resolve();
      }).catch(reject);
    });

    if (args.length > 0) {
      const cb = args[0];

      return promise
        .then(data => {
          cb.call(this, null, data);
        })
        .catch(err => {
          cb.call(this, `MacacaElectron error with: ${err}`);
        });
    } else {
      return promise;
    }
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
