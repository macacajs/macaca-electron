'use strict';

delete window.exports;
delete window.module;

const _ = require('lodash');
const { writeFile } = require('fs');
const {
  ipcRenderer, shell, remote,
  clipboard, desktopCapturer,
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
  'versions',
]);

window._electron_bridge = {
  fs: {
    writeFile,
  },
  ipcRenderer,
  shell,
  remote,
  clipboard,
  desktopCapturer,
  process: {
    ...processStaticValues,
    hang: () => {
      process.hang();
    },
    crash: () => {
      process.crash();
    },
    cwd: () => {
      process.cwd();
    },
  },
};
