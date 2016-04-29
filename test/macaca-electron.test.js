'use strict';

var co = require('co');
var path = require('path');

var Electron = require('../lib/macaca-electron');
var _ = require('../lib/helper');

describe('unit testing', function() {
  this.timeout(5 * 60 * 1000);

  describe('base', function() {
    it('should be ok', function() {
      Electron.should.be.ok;
    });
  });

  describe('methods testing', function() {

    var driver = new Electron();

    before(co.wrap(function *() {
      yield driver.startDevice({});
    }));

    it('electron device should be ok', () => {
      driver.should.be.ok;
    });

    it('get should be ok', co.wrap(function *() {
      yield driver.get('file://' + path.resolve(__dirname, 'webpages/1.html'));
      yield driver.maximize();
      var html = yield driver.getSource();
      html.should.match(/^<html/);
    }));

    it('get title', co.wrap(function *() {
      var title = yield driver.title();
      title.should.be.equal('Document 1');
    }));

    it('screenshot', co.wrap(function *() {
      var base64 = yield driver.getScreenshot();
      base64.should.match(/^[0-9a-z\/+=]+$/i);
    }));

    it('set input value', co.wrap(function *() {
      var input = yield driver.findElement('id', 'input');
      yield driver.setValue(input.ELEMENT, 'aaa');
      yield driver.clearText(input.ELEMENT);
      yield driver.setValue(input.ELEMENT, 'macaca');
      var style = yield driver.getComputedCss(input.ELEMENT, 'display');
      style.should.be.equal('inline-block');
      yield _.sleep(500);
    }));

    it('element attr', co.wrap(function *() {
      var button = yield driver.findElement('id', 'button-1');
      var buttonIsDiaplayed = yield driver.isDisplayed(button.ELEMENT);
      buttonIsDiaplayed.should.be.true;

      var bgColor = yield driver.getComputedCss(button.ELEMENT, 'background-color');
      bgColor.should.be.equal('rgb(255, 255, 255)');
    }));

    it('click button', co.wrap(function *() {
      var button = yield driver.findElement('id', 'button-1');
      yield driver.click(button.ELEMENT);
      yield _.sleep(300);
      var box = yield driver.findElement('id', 'target');
      var boxText = yield driver.getText(box.ELEMENT);
      boxText.should.be.equal('macaca');
    }));

    it('click link', co.wrap(function *() {
      var link = yield driver.findElement('id', 'link-1');
      yield driver.click(link.ELEMENT);
      yield _.sleep(1000);
      var title = yield driver.title();
      title.should.be.equal('Document 2');
    }));

    it('history back', co.wrap(function *() {
      yield driver.back();
      yield _.sleep(1000);
      yield driver.refresh();
      yield _.sleep(1000);
      var title = yield driver.title();
      title.should.be.equal('Document 1');
    }));

    it('open in new window', co.wrap(function *() {
      var link = yield driver.findElement('id', 'link-2');
      yield driver.click(link.ELEMENT);
      yield driver.maximize();
      yield _.sleep(3000);
      yield driver.getWindows();
    }));

    after(co.wrap(function *() {
      yield driver.stopDevice();
    }));

  });
});
