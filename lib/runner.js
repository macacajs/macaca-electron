/* ================================================================
 * macaca-electron by xdf(xudafeng[at]126.com)
 *
 * first created at : Tue Mar 29 2016 09:11:49 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright  xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

'use strict';

const Electron = require('electron');

const logger = require('./logger');

const app = Electron.app;
const BrowserWindow = Electron.BrowserWindow;

var mainWindow = null;

process.on('uncaughtException', function(e) {
  logger.debug(e.stack);
});

var wrapElectronResult = (value, status, message) => {
  status = status || 0;
  value = value || null;

  return {
    value,
    status,
    message
  };
};

var getUniqueIdFromWindow = (baseIndex => win => {
  return win.__MACACA_WINDOW_UID__ || (
    win.__MACACA_WINDOW_UID__ = ('WINDOW_' + baseIndex++)
  );
})(0);

var messageHandlers = {
  get(args, data) {
    var extraHeaders = {};
    mainWindow.webContents.loadURL(args.url, {
      extraHeaders: extraHeaders
    });
    mainWindow.webContents.once('did-finish-load', data => {
      logger.debug('window has been loaded.');
      process.send(wrapElectronResult());
    });
  },
  js(args, data) {
    mainWindow.webContents.executeJavaScript(args, result => {
      process.send(result);
    });
  },
  getWindows(args, data) {
    process.send(wrapElectronResult(BrowserWindow.getAllWindows().map(getUniqueIdFromWindow)));
  },
  setWindowSize(args, data) {
    // TODO by windowHandle
    mainWindow.setSize(args.width, args.height);
    process.send(wrapElectronResult());
  },
  maximize(args, data) {
    mainWindow.maximize();
    process.send(wrapElectronResult());
  },
  getScreenshot(args, data) {
    mainWindow.capturePage((image) => {
      let base64 = image.toPng().toString('base64');
      process.send(wrapElectronResult(base64));
    });
  },
  url() {
    process.send(wrapElectronResult(mainWindow.webContents.getURL()));
  }
};

process.on('message', data => {
  const action = data.action;
  const handler = messageHandlers[action];
  if (handler) {
    handler(data.args, data);
  } else {
    logger.debug('Unknown Action', data.action);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', (data) => {

  mainWindow = new BrowserWindow({
    //show: false, //silence
    //alwaysOnTop: true,
    x: 0,
    y: 0,
    width: 900,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setAudioMuted(true);
});
