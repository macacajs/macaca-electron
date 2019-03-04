# macaca-electron

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]

[npm-image]: https://img.shields.io/npm/v/macaca-electron.svg?style=flat-square
[npm-url]: https://npmjs.org/package/macaca-electron
[travis-image]: https://img.shields.io/travis/macacajs/macaca-electron.svg?style=flat-square
[travis-url]: https://travis-ci.org/macacajs/macaca-electron
[coveralls-image]: https://img.shields.io/coveralls/macacajs/macaca-electron.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/macacajs/macaca-electron?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_7-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> macaca electron driver

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars1.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars3.githubusercontent.com/u/4006436?v=4" width="100px;"/><br/><sub><b>meowtec</b></sub>](https://github.com/meowtec)<br/>|[<img src="https://avatars1.githubusercontent.com/u/1044425?v=4" width="100px;"/><br/><sub><b>ziczhu</b></sub>](https://github.com/ziczhu)<br/>|[<img src="https://avatars3.githubusercontent.com/u/1209810?v=4" width="100px;"/><br/><sub><b>paradite</b></sub>](https://github.com/paradite)<br/>|[<img src="https://avatars1.githubusercontent.com/u/43984518?v=4" width="100px;"/><br/><sub><b>xianxiaow</b></sub>](https://github.com/xianxiaow)<br/>|[<img src="https://avatars1.githubusercontent.com/u/4575751?v=4" width="100px;"/><br/><sub><b>jacksonlai</b></sub>](https://github.com/jacksonlai)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Wed Jan 30 2019 19:18:04 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

## Installment

```bash
$ npm i macaca-electron -g
```

## Environment Variable

set `MACACA_ELECTRON_DEVTOOLS=true` to open the devtools.

## Notice

### window.alert

Macaca disables `window.alert`, `window.prompt`, `window.confirm` from popping up by default, and you can override by `execute`.

## Standalone usage

```javascript

const co = require('co');
const fs = require('fs');
const path = require('path');
const Electron = require('macaca-electron');

const electron = new Electron();

co(function *() {
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
  yield electron.startDevice({
    show: false // in silence
  });

  yield electron.maximize();
  yield electron.setWindowSize(null, 500, 500);
  yield electron.get('https://www.baidu.com');
  const imgData = yield electron.getScreenshot();
  const img = new Buffer(imgData, 'base64');
  const p = path.join(__dirname, '..', 'screenshot.png')
  fs.writeFileSync(p, img.toString('binary'), 'binary');
  console.log(`screenshot: ${p}`);

  yield electron.stopDevice();
});

```

- [sample macaca-electron-screenshot](//github.com/macaca-sample/macaca-electron-screenshot)
- [More API](//macacajs.github.io/macaca-electron/)

## License

The MIT License (MIT)
