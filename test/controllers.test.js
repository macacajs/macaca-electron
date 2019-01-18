'use strict';

const path = require('path');

const _ = require('../lib/helper');
const Electron = require('../lib/macaca-electron');

const pkg = require('../package');

describe('controllers', function() {
  const WIDTH = 600;
  const HEIGHT = 600;
  this.timeout(5 * 60 * 1000);

  describe('methods testing', function() {

    var driver = new Electron();
    var customUserAgent = 'custom userAgent';

    before(function *() {
      yield driver.startDevice({
        show: false,
        userAgent: customUserAgent
      });
    });

    it('get should be ok', function *() {
      yield driver.get(`file://${path.resolve(__dirname, 'webpages/1.html')}`);
      yield driver.maximize();
      var html = yield driver.getSource();
      html.should.match(/^<html/);
      var uesrAgent = yield driver.execute('return navigator.userAgent');
      uesrAgent.should.be.equal(customUserAgent);
    });

    it('get title', function *() {
      var title = yield driver.title();
      title.should.be.equal('Document 1');
    });

    it('set window size', function *() {
      yield driver.setWindowSize(null, WIDTH, HEIGHT);
    });

    it('get window size', function *() {
      const size = yield driver.getWindowSize();
      size.width.should.be.equal(WIDTH);
      size.height.should.be.equal(HEIGHT);
    });

    it('screenshot', function *() {
      var base64 = yield driver.getScreenshot();
      base64.should.match(/^[0-9a-z\/+=]+$/i);
    });

    it('set input value', function *() {
      var input = yield driver.findElement('id', 'input');
      yield driver.setValue(input.ELEMENT, 'aaa');
      yield driver.clearText(input.ELEMENT);
      yield driver.setValue(input.ELEMENT, 'macaca');
      var style = yield driver.getComputedCss(input.ELEMENT, 'display');
      style.should.be.equal('inline-block');
      yield _.sleep(500);
    });

    it('element attr', function *() {
      var button = yield driver.findElement('id', 'button-1');
      var buttonIsDiaplayed = yield driver.isDisplayed(button.ELEMENT);
      buttonIsDiaplayed.should.be.true;

      var bgColor = yield driver.getComputedCss(button.ELEMENT, 'background-color');
      bgColor.should.be.equal('rgb(255, 255, 255)');
    });

    it('click button', function *() {
      var button = yield driver.findElement('id', 'button-1');
      yield driver.click(button.ELEMENT);
      yield _.sleep(300);
      var box = yield driver.findElement('id', 'target');
      var boxText = yield driver.getText(box.ELEMENT);
      boxText.should.be.equal('macaca');
    });

    it('click link', function *() {
      var link = yield driver.findElement('id', 'link-1');
      yield driver.click(link.ELEMENT);
      yield _.sleep(1000);
      var title = yield driver.title();
      title.should.be.equal('Document 2');
    });

    it('history back', function *() {
      yield driver.back();
      yield _.sleep(1000);
      yield driver.refresh();
      yield _.sleep(1000);
      var title = yield driver.title();
      title.should.be.equal('Document 1');
    });

    it('open in new window', function *() {
      var link = yield driver.findElement('id', 'link-2');
      yield driver.click(link.ELEMENT);
      yield driver.maximize();
      yield _.sleep(3000);
    });

    it('window handlers', function *() {
      var windows = yield driver.getWindows();
      windows.length.should.be.equal(3);
      yield driver.setWindow(windows[1]);
      var title = yield driver.title();
      title.should.be.equal('Document 3');
      yield driver.setWindow(windows[0]);
      title = yield driver.title();
      title.should.be.equal('Document 1');
    });

    it('cookie handlers', function *() {
      yield driver.deleteAllCookies();
      var cookies = yield driver.getAllCookies();
      cookies.length.should.be.equal(0);
      var cookie = {
        url: pkg.homepage,
        name: pkg.name,
        value: pkg.name
      };
      yield driver.addCookie(cookie);
      const res = yield driver.getNamedCookie(cookie.name);
      res.length.should.be.equal(1);
      yield driver.deleteAllCookies();
      cookies = yield driver.getAllCookies();
      cookies.length.should.be.equal(0);
    });

    after(function *() {
      yield driver.stopDevice();
    });

  });
});
