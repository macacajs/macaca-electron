'use strict';

const Electron = require('../lib/macaca-electron');

describe('test/macaca-electron.test.js', function() {
  this.timeout(5 * 60 * 1000);

  describe('base', function() {
    it('should be ok', function() {
      Electron.should.be.ok();
    });
  });

  describe('methods testing', function() {
    var driver = new Electron();
    var customUserAgent = 'custom userAgent';

    before(function *() {
      yield driver.startDevice({
        show: false,
        userAgent: customUserAgent
      });
    });

    it('electron device should be ok', () => {
      driver.should.be.ok();
    });

    it('get runner process', () => {
      const runnerProcess = driver.runnerProcess;
      runnerProcess.should.be.ok();
    });

    it('check whitelist', () => {
      const context = {url: '/'};
      const iswhiteList = driver.whiteList(context);
      iswhiteList.should.be.false();
    });

    it('is not proxy', () => {
      const isProxy = driver.isProxy();
      isProxy.should.be.false();
    });

    after(function *() {
      yield driver.stopDevice();
    });

  });
});
