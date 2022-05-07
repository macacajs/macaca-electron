'use strict';

const fs = require('fs');
const path = require('path');
const DataHubSDK = require('datahub-nodejs-sdk');
const {
  app,
  ipcMain,
  BrowserWindow,
  session,
  powerSaveBlocker
} = require('electron');

powerSaveBlocker.start('prevent-app-suspension');

const _ = require('./helper');
const logger = require('./logger');

const pkg = require('../package');

const datahubClient = new DataHubSDK();

let mainWindow = null;

const args = JSON.parse(process.argv[process.argv.length - 1]);

if (args.show === false && app.dock) {
  app.dock.hide();
}

// force dpr=1
if (args.hidpi === false) {
  app.commandLine.appendSwitch('force-device-scale-factor', 1);
}

const IPC_CHANNLE_NAME = 'ipc';

ipcMain.on(IPC_CHANNLE_NAME, async (event, arg) => {
  const argData = arg.data;
  switch (arg.action) {
    case 'screenshot':
      mainWindow.capturePage().then(image => {
        const data = image.toDataURL();
        const base64 = data.split(',')[1];
        const img = new Buffer(base64, 'base64');
        let dir = path.join(process.cwd(), argData.dir);
        _.mkdir(path.dirname(dir));
        fs.writeFileSync(dir, img.toString('binary'), 'binary');
        event.sender.send(IPC_CHANNLE_NAME, { argData });
      });
      break;
    case 'switchScene':
      await datahubClient.switchScene(argData);
      event.sender.send(IPC_CHANNLE_NAME, { argData });
      break;
    case 'switchAllScenes':
      await datahubClient.switchAllScenes(argData);
      event.sender.send(IPC_CHANNLE_NAME, { argData });
      break;
    case 'exit':
      event.sender.send(IPC_CHANNLE_NAME, { argData });
      app.quit();
      process.exit(argData.failedCount ? 1 : 0);
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
    const performGet = (args, data) => {
      mainWindow.webContents.loadURL(args.url, {
        extraHeaders: args.args.extraHeaders || {},
        userAgent: args.args.userAgent || pkg.description
      });
      mainWindow.webContents.once('did-finish-load', data => {
        mainWindow.webContents.enableDeviceEmulation({
          screenPosition: 'mobile'
        });
        logger.debug('window has been loaded.');
        process.send(wrapElectronResult());
      });
      if (process.env.MACACA_ELECTRON_DEVTOOLS) {
        mainWindow.openDevTools();
      }
    };

    if (args.preserveCookies || args.args.preserveCookies) {
      performGet(args, data);
    } else {
      mainWindow.webContents.session
        .clearStorageData({
          storages: 'cookies'
        })
        .then(() => {
          performGet(args, data);
        });
    }
  },

  js(args, data) {
    mainWindow.webContents.executeJavaScript(args, true).then(result => {
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
        throw new Error('No window found');
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

  getWindowSize() {
    const size = mainWindow.getSize();
    process.send(
      wrapElectronResult({
        width: size[0],
        height: size[1]
      })
    );
  },

  maximize(args, data) {
    mainWindow.maximize();
    process.send(wrapElectronResult());
  },

  // https://electronjs.org/docs/api/cookies
  getAllCookies() {
    session.defaultSession.cookies
      .get({})
      .then(cookies => {
        process.send(wrapElectronResult(cookies));
      })
      .catch(error => {
        process.send(wrapElectronResult(null, error));
      });
  },

  getNamedCookie(name) {
    session.defaultSession.cookies
      .get({})
      .then(cookies => {
        let cookie = _.filter(cookies, item => item.name === name);
        process.send(wrapElectronResult(cookie));
      })
      .catch(error => {
        process.send(wrapElectronResult(null, error));
      });
  },

  addCookie(cookie) {
    session.defaultSession.cookies
      .set(cookie)
      .then(() => {
        process.send(wrapElectronResult(cookie));
      })
      .catch(error => {
        process.send(wrapElectronResult(null, 25, error.message));
      });
  },

  deleteCookie({ name, url }) {
    if (url) {
      session.defaultSession.cookies
        .remove(url, name)
        .then(() => {
          process.send(wrapElectronResult(null));
        })
        .catch(error => {
          process.send(wrapElectronResult(null, error));
        });
    } else {
      // backwards compatible with old behaviour deleting all cookies when url is empty
      session.defaultSession
        .clearStorageData()
        .then(() => {
          process.send(wrapElectronResult(null));
        })
        .catch(error => {
          process.send(wrapElectronResult(null, error));
        });
    }
  },

  deleteAllCookies() {
    session.defaultSession
      .clearStorageData()
      .then(() => {
        process.send(wrapElectronResult(null));
      })
      .catch(error => {
        process.send(wrapElectronResult(null, error));
      });
  },

  clearLocalstorage() {
    mainWindow.webContents.session
      .clearStorageData({
        storages: 'localstorage'
      })
      .then(() => {
        process.send(wrapElectronResult(null));
      })
      .catch(error => {
        process.send(wrapElectronResult(null, error));
      });
  },

  getScreenshot(args, data) {
    mainWindow.capturePage().then(image => {
      let data = image.toDataURL();
      let base64 = data.split(',')[1];
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
    webSecurity: false,
    allowRunningInsecureContent: true,
    allowDisplayingInsecureContent: true,
    backgroundThrottling: false,
    preload: path.join(__dirname, 'preload.js')
  }
};

app.on('ready', data => {
  const options = _.merge(defaultOptions, args);
  mainWindow = new BrowserWindow(options);
  if (options.webPreferences.enableRemoteModule) {
    require('@electron/remote/main').initialize();
    require('@electron/remote/main').enable(mainWindow.webContents);
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.audioMuted = true;
  // https://github.com/electron/electron/issues/18214
  app.commandLine.appendSwitch('disable-site-isolation-trials');
});

app.on(
  'certificate-error',
  (e, webContents, url, error, certificate, callback) => {
    e.preventDefault();
    callback(true);
  }
);
