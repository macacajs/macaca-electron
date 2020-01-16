'use strict';

const path = require('path');
const assert = require('assert');

const { errors } = require('webdriver-dfn-error-code');
const _ = require('../lib/helper');
const Electron = require('../lib/macaca-electron');

// const pkg = require('../package');

describe('test/controllers.test.js', function() {
  const WIDTH = 600;
  const HEIGHT = 600;
  this.timeout(5 * 60 * 1000);

  describe('methods testing', function() {
    var driver = new Electron();
    var customUserAgent = 'custom userAgent';

    before(async () => {
      await driver.startDevice({
        show: false,
        userAgent: customUserAgent
      });
    });

    it('get is ok', async () => {
      await driver.get(`file://${path.resolve(__dirname, 'webpages/1.html')}`);
      await driver.maximize();
      var html = await driver.getSource();
      assert(html.includes('<html'));
    });

    it('execute ok', async () => {
      var uesrAgent = await driver.execute('return navigator.userAgent');
      assert.equal(uesrAgent, customUserAgent);
      // failing due to a bug
      // var arrayResult = await driver.execute('return [1, 2, 3]');
      // assert.equal(arrayResult, [1, 2, 3]);
    });

    it('get url', async () => {
      var url = await driver.url();
      assert.equal(/1\.html$/.test(url), true);
    });

    it('does not implement forward', async () => {
      let f = () => {};
      try {
        await driver.forward();
      } catch (e) {
        f = () => {
          throw e;
        };
      } finally {
        assert.throws(f, errors.NotImplementedError);
      }
    });

    it('get title', async () => {
      var title = await driver.title();
      assert.equal(title, 'Document 1');
    });

    it('set window size', async () => {
      await driver.setWindowSize(null, WIDTH, HEIGHT);
    });

    it('get window size', async () => {
      const size = await driver.getWindowSize();
      assert.equal(size.width, WIDTH);
      assert.equal(size.height, HEIGHT);
    });

    it('screenshot', async () => {
      var base64 = await driver.getScreenshot();
      assert.equal(/^[0-9a-z\/+=]+$/i.test(base64), true);
    });

    it('find element', async () => {
      var input = await driver.findElement('id', 'input');
      assert.ok(input);

      let f = () => {};
      try {
        // need to wait for 5 seconds timeout
        await driver.findElement('id', 'non-existent');
      } catch (e) {
        f = () => {
          throw e;
        };
      } finally {
        assert.throws(f, errors.NoSuchElement);
      }
    });

    it('find elements', async () => {
      const divs = await driver.findElements('name', 'test');
      assert.equal(divs.length, 2);
      var input = await driver.findElements('id', 'input');
      assert.equal(input.length, 1);
      // need to wait for 5 seconds timeout
      var nonExistent = await driver.findElements('id', 'non-existent');
      assert.equal(nonExistent.length, 0);
    });

    it('set input value', async () => {
      var input = await driver.findElement('id', 'input');
      await driver.setValue(input.ELEMENT, 'aaa');
      await driver.clearText(input.ELEMENT);
      await driver.setValue(input.ELEMENT, 'macaca');
      var style = await driver.getComputedCss(input.ELEMENT, 'display');
      assert.equal(style, 'inline-block');
      await _.sleep(200);
    });

    it('element attr', async () => {
      var button = await driver.findElement('id', 'button-1');
      var buttonIsDiaplayed = await driver.isDisplayed(button.ELEMENT);
      assert.equal(buttonIsDiaplayed, true);

      var bgColor = await driver.getComputedCss(
        button.ELEMENT,
        'background-color'
      );
      assert.equal(bgColor, 'rgb(255, 255, 255)');
    });

    it('get property', async () => {
      var button = await driver.findElement('id', 'button-1');
      var buttonId = await driver.getProperty(button.ELEMENT, 'id');
      assert.equal(buttonId, 'button-1');
    });

    it('click button', async () => {
      var button = await driver.findElement('id', 'button-1');
      await driver.click(button.ELEMENT);
      await _.sleep(200);
      var box = await driver.findElement('id', 'target');
      var boxText = await driver.getText(box.ELEMENT);
      assert.equal(boxText, 'macaca');
    });

    it('click link', async () => {
      var link = await driver.findElement('id', 'link-1');
      await driver.click(link.ELEMENT);
      await _.sleep(200);
      var title = await driver.title();
      assert.equal(title, 'Document 2');
    });

    it('history back', async () => {
      await driver.back();
      await _.sleep(200);
      await driver.refresh();
      await _.sleep(200);
      var title = await driver.title();
      assert.equal(title, 'Document 1');
    });

    it('open in new window', async () => {
      var link = await driver.findElement('id', 'link-2');
      await driver.click(link.ELEMENT);
      await driver.maximize();
      await _.sleep(500);
    });

    it('window handlers', async () => {
      var windows = await driver.getWindows();
      assert.equal(windows.length, 3);
      await driver.setWindow(windows[1]);
      var title = await driver.title();
      assert.equal(title, 'Document 3');
      await driver.setWindow(windows[0]);
      title = await driver.title();
      assert.equal(title, 'Document 1');
    });

    it('set frame that exists and send command', async () => {
      await driver.get(`file://${path.resolve(__dirname, 'webpages/4.html')}`);
      const iframeElement = await driver.findElement('id', 'iframe1');
      let result = await driver.setFrame(0);
      assert.equal(result, null);
      result = await driver.setFrame(iframeElement);
      assert.equal(result, null);
      const link = await driver.findElement('id', 'link-2');
      assert.ok(link);
    });

    // it('set frame that does not exist', async () => {
    //   await driver.get(`file://${path.resolve(__dirname, 'webpages/4.html')}`);

    //   let f = () => {};
    //   try {
    //     await driver.setFrame(123);
    //   } catch (e) {
    //     f = () => {
    //       throw e;
    //     };
    //   } finally {
    //     assert.throws(f, errors.NoSuchFrame);
    //   }

    //   let g = () => {};
    //   try {
    //     await driver.setFrame('123');
    //   } catch (e) {
    //     g = () => {
    //       throw e;
    //     };
    //   } finally {
    //     console.log(g);
    //     // assert.throws(g, errors.NoSuchFrame);
    //   }
    // });

    // it('cookie handlers', async () => {
    //   await driver.deleteAllCookies();
    //   var cookies = await driver.getAllCookies();
    //   assert.equal(cookies.length, 0);
    //   var cookie = {
    //     url: pkg.homepage,
    //     name: pkg.name,
    //     value: pkg.name
    //   };
    //   await driver.addCookie(cookie);
    //   const res = await driver.getNamedCookie(cookie.name);
    //   assert.equal(res.length, 1);

    //   var cookie2 = {
    //     url: pkg.homepage,
    //     name: 'cookie-test',
    //     value: 'cookie-test'
    //   };
    //   await driver.addCookie(cookie2);
    //   cookies = await driver.getAllCookies();
    //   assert.equal(cookies.length, 2);
    //   await driver.deleteCookie('cookie-test');
    //   cookies = await driver.getAllCookies();
    //   // failing due to a bug
    //   // assert.equal(cookies.length, 1);
    //   await driver.deleteAllCookies();
    //   cookies = await driver.getAllCookies();
    //   assert.equal(cookies.length, 0);
    // });

    // it('cookie does not persists across gets by default', async () => {
    //   await driver.get('https://www.baidu.com');
    //   const cookie = {
    //     url: 'https://www.baidu.com',
    //     domain: '.baidu.com',
    //     name: pkg.name,
    //     value: pkg.name,
    //     expirationDate: 253375862400
    //   };
    //   await driver.addCookie(cookie);
    //   await driver.get('https://www.baidu.com');
    //   const res = await driver.getNamedCookie(cookie.name);
    //   assert.equal(res.length, 0);
    // });

    // it('cookie persists across gets with preserveCookies', async () => {
    //   await driver.get('https://www.baidu.com', { preserveCookies: true });
    //   const cookie = {
    //     url: 'https://www.baidu.com',
    //     domain: '.baidu.com',
    //     name: pkg.name,
    //     value: pkg.name,
    //     expirationDate: 253375862400
    //   };
    //   await driver.addCookie(cookie);
    //   await driver.get('https://www.baidu.com', { preserveCookies: true });
    //   const res = await driver.getNamedCookie(cookie.name);
    //   assert.equal(res.length, 1);
    // });

    it('clears local storage', async () => {
      await driver.get('https://www.baidu.com');
      await driver.clearLocalstorage();
    });

    after(async () => {
      await driver.stopDevice();
    });
  });
});
