'use strict';

delete window.exports;
delete window.module;

const _ = require('lodash');
const { writeFile } = require('fs');
const {
  ipcRenderer, shell,
  clipboard, desktopCapturer,
  contextBridge
} = require('electron');

const processStaticValues = _.pick(process, [
  'arch',
  'argv',
  'argv0',
  'execArgv',
  'execPath',
  'helperExecPath',
  'platform',
  'type',
  'version',
  'versions'
]);

contextBridge.exposeInMainWorld(
  '_electron_bridge',
  {
    fs: {
      writeFile
    },
    ipcRenderer,
    shell,
    clipboard,
    desktopCapturer,
    process: Object.assign(processStaticValues, {
      hang: () => {
        process.hang();
      },
      crash: () => {
        process.crash();
      },
      cwd: () => {
        process.cwd();
      }
    })
  }
);
