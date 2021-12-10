# macaca-electron

[![NPM version][npm-image]][npm-url]
[![Package quality][quality-image]][quality-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]

[npm-image]: https://img.shields.io/npm/v/macaca-electron.svg
[npm-url]: https://npmjs.org/package/macaca-electron
[quality-image]: https://packagequality.com/shield/macaca-electron.svg
[quality-url]: https://packagequality.com/#?package=macaca-electron
[travis-image]: https://img.shields.io/travis/macacajs/macaca-electron.svg
[travis-url]: https://travis-ci.org/macacajs/macaca-electron
[coveralls-image]: https://img.shields.io/coveralls/macacajs/macaca-electron.svg
[coveralls-url]: https://coveralls.io/r/macacajs/macaca-electron?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_7-green.svg
[node-url]: http://nodejs.org/download/

> macaca electron driver

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars.githubusercontent.com/u/1044425?v=4" width="100px;"/><br/><sub><b>ziczhu</b></sub>](https://github.com/ziczhu)<br/>|[<img src="https://avatars.githubusercontent.com/u/4006436?v=4" width="100px;"/><br/><sub><b>meowtec</b></sub>](https://github.com/meowtec)<br/>|[<img src="https://avatars.githubusercontent.com/u/1209810?v=4" width="100px;"/><br/><sub><b>paradite</b></sub>](https://github.com/paradite)<br/>|[<img src="https://avatars.githubusercontent.com/u/1487773?v=4" width="100px;"/><br/><sub><b>coffeedeveloper</b></sub>](https://github.com/coffeedeveloper)<br/>|[<img src="https://avatars.githubusercontent.com/u/17586742?v=4" width="100px;"/><br/><sub><b>sriting</b></sub>](https://github.com/sriting)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Fri Dec 10 2021 23:35:34 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

## Installment

```bash
$ npm i macaca-electron -g
```

## Release Plan

Simply put, Chromium doesn't stop shipping so Electron is not going to slow down either, so Macaca is not stop...

Starting with Electron version 7, Macaca will always upgrade with the Electron's main version.

- [12-week-cadence](https://electronjs.org/blog/12-week-cadence)
- [releases/stable](https://electronjs.org/releases/stable)

## Environment Variable

set `MACACA_ELECTRON_DEVTOOLS=1` to open the devtools.

## Notice

### window.alert

Macaca disables `window.alert`, `window.prompt`, `window.confirm` from popping up by default, and you can override by `execute`.

## Standalone usage

```javascript
const fs = require('fs');
const path = require('path');
const Electron = require('macaca-electron');

const electron = new Electron();

/**
  default options
  {
    show: true,
    alwaysOnTop: false,
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    userAgent: 'userAgent string',
    webPreferences: {
      nodeIntegration: false
    }
  }
*/
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await electron.startDevice({
    show: false // in silence
  });
  await electron.maximize();
  await electron.setWindowSize(null, 500, 500);
  await electron.get('https://www.baidu.com');
  await sleep(3000);
  const imgData = await electron.getScreenshot();
  const img = Buffer.from(imgData, 'base64');
  const p = path.join('screenshot.png');
  fs.writeFileSync(p, img.toString('binary'), 'binary');
  console.log(`screenshot: ${p}`);

  await electron.stopDevice();
})();
```

- [sample macaca-electron-screenshot](//github.com/macaca-sample/macaca-electron-screenshot)
- [More API](//macacajs.github.io/macaca-electron/)

## License

The MIT License (MIT)
