'use strict';

const path = require('path');
const wd = require('macaca-wd');

describe('./test/wd/wait-for-element.test.js', function() {
  this.timeout(5 * 60 * 1000);

  const driver = wd.promiseChainRemote({
    host: 'localhost',
    port: process.env.MACACA_SERVER_PORT || 3456
  });

  before(() => {
    return driver
      .init({
        platformName: 'desktop',
        browserName: 'electron',
        userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0 Safari/537.36 Macaca Custom UserAgent',
        deviceScaleFactor: 2
      })
      .setWindowSize(800, 600);
  });

  afterEach(function() {
    return driver
      .customSaveScreenshot(this)
      .sleep(1000);
  });

  after(() => {
    return driver
      .sleep(1000)
      .quit();
  });

  describe('wait for element', function() {
    it('#0 should be ok', function() {
      const url = `file://${path.resolve(__dirname, '..', 'webpages', '1.html')}`;
      return driver
        .get(url)
        .sleep(2000);
    });
  });
});
