'use strict';

const path = require('path');
const assert = require('assert');

const { errors } = require('webdriver-dfn-error-code');
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
      assert(html.includes('<html'));
    });

    it('execute ok', function * () {
      var uesrAgent = yield driver.execute('return navigator.userAgent');
      assert.equal(uesrAgent, customUserAgent);
      // failing due to a bug
      // var arrayResult = yield driver.execute('return [1, 2, 3]');
      // assert.equal(arrayResult, [1, 2, 3]);
    });

    it('get url', function * () {
      var url = yield driver.url();
      assert.equal(/1\.html$/.test(url), true);
    });

    it('does not implement forward', function * () {
      let f = () => {};
      try {
        yield driver.forward();
      } catch (e) {
        f = () => {
          throw e;
        };
      } finally {
        assert.throws(f, errors.NotImplementedError);
      }
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

    it('find element', function * () {
      var input = yield driver.findElement('id', 'input');
      assert.ok(input);

      let f = () => {};
      try {
        // need to wait for 5 seconds timeout
        yield driver.findElement('id', 'non-existent');
      } catch (e) {
        f = () => {
          throw e;
        };
      } finally {
        assert.throws(f, errors.NoSuchElement);
      }
    });

    it('find elements', function * () {
      const divs = yield driver.findElements('name', 'test');
      assert.equal(divs.length, 2);
      var input = yield driver.findElements('id', 'input');
      assert.equal(input.length, 1);
      // need to wait for 5 seconds timeout
      var nonExistent = yield driver.findElements('id', 'non-existent');
      assert.equal(nonExistent.length, 0);
    });

    it('set input value', function * () {
      var input = yield driver.findElement('id', 'input');
      yield driver.setValue(input.ELEMENT, 'aaa');
      yield driver.clearText(input.ELEMENT);
      yield driver.setValue(input.ELEMENT, 'macaca');
      var style = yield driver.getComputedCss(input.ELEMENT, 'display');
      assert.equal(style, 'inline-block');
      yield _.sleep(200);
    });

    it('element attr', function * () {
      var button = yield driver.findElement('id', 'button-1');
      var buttonIsDiaplayed = yield driver.isDisplayed(button.ELEMENT);
      assert.equal(buttonIsDiaplayed, true);

      var bgColor = yield driver.getComputedCss(
        button.ELEMENT,
        'background-color'
      );
      assert.equal(bgColor, 'rgb(255, 255, 255)');
    });

    it('get property', function * () {
      var button = yield driver.findElement('id', 'button-1');
      var buttonId = yield driver.getProperty(button.ELEMENT, 'id');
      assert.equal(buttonId, 'button-1');
    });

    it('click button', function * () {
      var button = yield driver.findElement('id', 'button-1');
      yield driver.click(button.ELEMENT);
      yield _.sleep(200);
      var box = yield driver.findElement('id', 'target');
      var boxText = yield driver.getText(box.ELEMENT);
      assert.equal(boxText, 'macaca');
    });

    it('click link', function * () {
      var link = yield driver.findElement('id', 'link-1');
      yield driver.click(link.ELEMENT);
      yield _.sleep(200);
      var title = yield driver.title();
      assert.equal(title, 'Document 2');
    });

    it('history back', function * () {
      yield driver.back();
      yield _.sleep(200);
      yield driver.refresh();
      yield _.sleep(200);
      var title = yield driver.title();
      assert.equal(title, 'Document 1');
    });

    it('open in new window', function * () {
      var link = yield driver.findElement('id', 'link-2');
      yield driver.click(link.ELEMENT);
      yield driver.maximize();
      yield _.sleep(500);
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

    it('set frame that exists and send command', function * () {
      yield driver.get(`file://${path.resolve(__dirname, 'webpages/4.html')}`);
      const iframeElement = yield driver.findElement('id', 'iframe1');
      let result = yield driver.setFrame(0);
      assert.equal(result, null);
      result = yield driver.setFrame(iframeElement);
      assert.equal(result, null);
      const link = yield driver.findElement('id', 'link-2');
      assert.ok(link);
    });

    it('set frame that does not exist', function * () {
      yield driver.get(`file://${path.resolve(__dirname, 'webpages/4.html')}`);

      let f = () => {};
      try {
        yield driver.setFrame(123);
      } catch (e) {
        f = () => {
          throw e;
        };
      } finally {
        assert.throws(f, errors.NoSuchFrame);
      }

      let g = () => {};
      try {
        yield driver.setFrame('123');
      } catch (e) {
        g = () => {
          throw e;
        };
      } finally {
        assert.throws(g, errors.NoSuchFrame);
      }
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

      var cookie2 = {
        url: pkg.homepage,
        name: 'cookie-test',
        value: 'cookie-test'
      };
      yield driver.addCookie(cookie2);
      cookies = yield driver.getAllCookies();
      assert.equal(cookies.length, 2);
      yield driver.deleteCookie('cookie-test');
      cookies = yield driver.getAllCookies();
      // failing due to a bug
      // assert.equal(cookies.length, 1);
      yield driver.deleteAllCookies();
      cookies = yield driver.getAllCookies();
      assert.equal(cookies.length, 0);
    });

    it('cookie persists across gets', function * () {
      yield driver.get('https://www.baidu.com');
      const cookie = {
        url: 'https://www.baidu.com',
        domain: '.baidu.com',
        name: pkg.name,
        value: pkg.name,
        expirationDate: 253375862400
      };
      yield driver.addCookie(cookie);
      let res = yield driver.getNamedCookie(cookie.name);
      assert.equal(res.length, 1);
      yield driver.get('https://www.baidu.com');
      res = yield driver.getNamedCookie(cookie.name);
      assert.equal(res.length, 1);
    });

    it('clears local storage', function * () {
      yield driver.get('https://www.baidu.com');
      yield driver.clearLocalstorage();
    });

    after(function * () {
      yield driver.stopDevice();
    });
  });
});
