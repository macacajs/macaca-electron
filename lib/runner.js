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

var app = require('electron').app;
var ipcMain = require('electron').ipcMain;
var BrowserWindow = require('electron').BrowserWindow;

process.on('uncaughtException', function(e) {
  console.log(e.stack);
});

app.on('ready', function() {
  var win = new BrowserWindow(options);

  win.webContents.setAudioMuted(true);
  console.log('-=-=-==-');
});
