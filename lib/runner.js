'use strict';

const fs = require('fs');
const path = require('path');
const Electron = require('electron');

const _ = require('./helper');
const logger = require('./logger');

const app = Electron.app;
const BrowserWindow = Electron.BrowserWindow;
const ipcMain = Electron.ipcMain;

var mainWindow = null;

var args = JSON.parse(process.argv[process.argv.length - 1]);

// force dpr=1
if (args.hidpi === false) {
  app.commandLine.appendSwitch('force-device-scale-factor', 1);
}

ipcMain.on('ipc', (event, arg) => {
  const data = arg.data;
  switch (arg.action) {
    case 'screenshot':
      mainWindow.capturePage(image => {
        let base64 = image.toPng().toString('base64');
        const img = new Buffer(base64, 'base64');
        let dir = path.join(process.cwd(), data.dir);
        _.mkdir(path.dirname(dir));
        fs.writeFileSync(dir, img.toString('binary'), 'binary');
      });
    break;
    case 'exit':
      app.quit();
      if (data.failedCount) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    break;
  }
});

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

var defaultOptions = {
  show: true,
  alwaysOnTop: false,
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: false
  }
};

app.on('ready', data => {

  mainWindow = new BrowserWindow(_.merge(defaultOptions, args));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setAudioMuted(true);
});
