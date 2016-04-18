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

const macacaUtils = require('macaca-utils');
const childProcess = require('child_process');

var _ = macacaUtils.merge({}, macacaUtils);

_.sleep = function(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};

_.retry = function(func, interval, num) {
  return new Promise((resolve, reject) => {
    func().then(resolve, err => {
      if (num > 0 || typeof num === 'undefined') {
        _.sleep(interval).then(() => {
          resolve(_.retry(func, interval, num - 1));
        });
      } else {
        reject(err);
      }
    });
  });
};

_.waitForCondition = function(func, wait/*ms*/, interval/*ms*/) {
  wait = wait || 5000;
  interval = interval || 500;
  let start = Date.now();
  let end = start + wait;

  const fn = function() {
    return new Promise((resolve, reject) => {
      const continuation = (res, rej) => {
        let now = Date.now();

        if (now < end) {
          res(_.sleep(interval).then(fn));
        } else {
          rej(`Wait For Condition timeout ${wait}`);
        }
      };
      func().then(isOk => {

        if (!!isOk) {
          resolve();
        } else {
          continuation(resolve, reject);
        }
      }).catch(e => {
        continuation(resolve, reject);
      });
    });
  };
  return fn();
};

_.escapeString = function(str) {
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t')
    .replace(/[\"]/g, '\\"')
    .replace(/\\'/g, '\\\'');
};

_.exec = function(cmd, opts) {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, _.merge({
      maxBuffer: 1024 * 512,
      wrapArgs: false
    }, opts || {}), (err, stdout) => {
      if (err) {
        return reject(err);
      }
      resolve(_.trim(stdout));
    });
  });
};

_.spawn = function() {
  var args = Array.prototype.slice.call(arguments);

  return new Promise((resolve, reject) => {
    var stdout = '';
    var stderr = '';
    var child = childProcess.spawn.apply(childProcess, args);

    child.on('error', error => {
      reject(error);
    });

    child.stdout.on('data', data => {
      stdout += data;
    });

    child.stderr.on('data', data => {
      stderr += data;
    });

    child.on('close', code => {
      var error;
      if (code) {
        error = new Error(stderr);
        error.code = code;
        return reject(error);
      }
      resolve([stdout, stderr]);
    });
  });
};

module.exports = _;
