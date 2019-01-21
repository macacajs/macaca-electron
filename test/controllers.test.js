'use strict';

const path = require('path');
const assert = require('assert');

const _ = require('../lib/helper');
const Electron = require('../lib/macaca-electron');

const pkg = require('../package');

describe('test/controllers.test.js', function() {
  const WIDTH = 600;
  const HEIGHT = 600;
  this.timeout(5 * 60 * 1000);

  describe('methods testing', function() {

    var driver = new Electron();
    var customUserAgent = 'custom userAgent';

    before(function * () {
      yield driver.startDevice({
        show: false,
        userAgent: customUserAgent
      });
    });

    it('get is ok', function * () {
      yield driver.get(`file://${path.resolve(__dirname, 'webpages/1.html')}`);
      yield driver.maximize();
      var html = yield driver.getSource();
      assert(html.includes(('<html')));
      var uesrAgent = yield driver.execute('return navigator.userAgent');
      assert.equal(uesrAgent, customUserAgent);
    });

    it('get title', function * () {
      var title = yield driver.title();
      assert.equal(title, 'Document 1');
    });

    it('set window size', function * () {
      yield driver.setWindowSize(null, WIDTH, HEIGHT);
    });

    it('get window size', function * () {
      const size = yield driver.getWindowSize();
      assert.equal(size.width, WIDTH);
      assert.equal(size.height, HEIGHT);
    });

    it('screenshot', function * () {
      var base64 = yield driver.getScreenshot();
      assert.equal(/^[0-9a-z\/+=]+$/i.test(base64), true);
    });

    it('set input value', function * () {
      var input = yield driver.findElement('id', 'input');
      yield driver.setValue(input.ELEMENT, 'aaa');
      yield driver.clearText(input.ELEMENT);
      yield driver.setValue(input.ELEMENT, 'macaca');
      var style = yield driver.getComputedCss(input.ELEMENT, 'display');
      assert.equal(style, 'inline-block');
      yield _.sleep(500);
    });

    it('element attr', function * () {
      var button = yield driver.findElement('id', 'button-1');
      var buttonIsDiaplayed = yield driver.isDisplayed(button.ELEMENT);
      assert.equal(buttonIsDiaplayed, true);

      var bgColor = yield driver.getComputedCss(button.ELEMENT, 'background-color');
      assert.equal(bgColor, 'rgb(255, 255, 255)');
    });

    it('click button', function * () {
      var button = yield driver.findElement('id', 'button-1');
      yield driver.click(button.ELEMENT);
      yield _.sleep(300);
      var box = yield driver.findElement('id', 'target');
      var boxText = yield driver.getText(box.ELEMENT);
      assert.equal(boxText, 'macaca');
    });

    it('click link', function * () {
      var link = yield driver.findElement('id', 'link-1');
      yield driver.click(link.ELEMENT);
      yield _.sleep(1000);
      var title = yield driver.title();
      assert.equal(title, 'Document 2');
    });

    it('history back', function * () {
      yield driver.back();
      yield _.sleep(1000);
      yield driver.refresh();
      yield _.sleep(1000);
      var title = yield driver.title();
      assert.equal(title, 'Document 1');
    });

    it('open in new window', function * () {
      var link = yield driver.findElement('id', 'link-2');
      yield driver.click(link.ELEMENT);
      yield driver.maximize();
      yield _.sleep(3000);
    });

    it('window handlers', function * () {
      var windows = yield driver.getWindows();
      assert.equal(windows.length, 3);
      yield driver.setWindow(windows[1]);
      var title = yield driver.title();
      assert.equal(title, 'Document 3');
      yield driver.setWindow(windows[0]);
      title = yield driver.title();
      assert.equal(title, 'Document 1');
    });

    it('cookie handlers', function * () {
      yield driver.deleteAllCookies();
      var cookies = yield driver.getAllCookies();
      assert.equal(cookies.length, 0);
      var cookie = {
        url: pkg.homepage,
        name: pkg.name,
        value: pkg.name
      };
      yield driver.addCookie(cookie);
      const res = yield driver.getNamedCookie(cookie.name);
      assert.equal(res.length, 1);
      yield driver.deleteAllCookies();
      cookies = yield driver.getAllCookies();
      assert.equal(cookies.length, 0);
    });

    after(function * () {
      yield driver.stopDevice();
    });

  });
});
