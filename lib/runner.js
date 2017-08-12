'use strict';

const fs = require('fs');
const path = require('path');
const {
  app,
  ipcMain,
  BrowserWindow
} = require('electron');

const _ = require('./helper');
const logger = require('./logger');

const pkg = require('../package');

let mainWindow = null;

const args = JSON.parse(process.argv[process.argv.length - 1]);

if (args.show === false && app.dock) {
  app.dock.hide();
}

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

      process.exit(data.failedCount ? 1 : 0);
      break;
  }
});

process.on('uncaughtException', function(e) {
  logger.debug(e.stack);
});

const wrapElectronResult = (value, status, message) => {
  status = status || 0;
  value = value || null;

  return {
    value,
    status,
    message
  };
};

const messageHandlers = {
  get(args, data) {
    mainWindow.webContents.loadURL(args.url, {
      extraHeaders: args.args.raHeaders || {},
      userAgent: args.args.userAgent || pkg.description
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
    const windows = BrowserWindow.getAllWindows();
    const windowHandlers = windows.map(win => win.id).sort();
    process.send(wrapElectronResult(windowHandlers));
  },

  setWindow(id) {
    let window;
    try {
      window = BrowserWindow.fromId(id);
      if (!window) {
        throw 'No window found';
      }
    } catch (e) {
      process.send(wrapElectronResult(null, 23));
      return;
    }

    window.focus();
    mainWindow = window;
    process.send(wrapElectronResult());
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

const defaultOptions = {
  show: true,
  alwaysOnTop: false,
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: false,
    webSecurity: false,
    allowRunningInsecureContent: true,
    allowDisplayingInsecureContent: true
  }
};

app.on('ready', data => {
  mainWindow = new BrowserWindow(_.merge(defaultOptions, args));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.setAudioMuted(true);
});

app.on('certificate-error', (e, webContents, url, error, certificate, callback) => {
  e.preventDefault();
  callback(true);
});
