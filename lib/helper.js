'use strict';

const macacaUtils = require('macaca-utils');

var _ = macacaUtils.merge({}, macacaUtils);

_.sleep = function(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
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

module.exports = _;
