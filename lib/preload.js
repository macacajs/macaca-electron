'use strict';

delete window.exports;
delete window.module;

const { writeFile } = require('fs');

window._electron_bridge = {
  writeFile,
};
