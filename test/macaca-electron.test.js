'use strict';

const assert = require('assert');
const Electron = require('../lib/macaca-electron');

describe('test/macaca-electron.test.js', function() {
  this.timeout(5 * 60 * 1000);

  describe('base', function() {
    it('is ok', function() {
      assert.ok(Electron);
    });
  });

  describe('methods testing', function() {
    var driver = new Electron();
    var customUserAgent = 'custom userAgent';

    before(function * () {
      yield driver.startDevice({
        show: false,
        userAgent: customUserAgent
      });
    });

    it('electron device is ok', () => {
      assert.ok(driver);
    });

    it('get runner process', () => {
      const runnerProcess = driver.runnerProcess;
      assert.ok(runnerProcess);
    });

    it('check whitelist', () => {
      const context = {url: '/'};
      const iswhiteList = driver.whiteList(context);
      assert.equal(iswhiteList, false);
    });

    it('is not proxy', () => {
      const isProxy = driver.isProxy();
      assert.equal(isProxy, false);
    });

    after(function * () {
      yield driver.stopDevice();
    });

  });
});
