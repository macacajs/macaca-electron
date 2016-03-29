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

const Q = require('q');
const fs = require('fs');
const path = require('path');

const _ = require('./helper');

function PromiseChain() {
  this.deferred = Q.defer();
}

PromiseChain.prototype._then = function(cb, errCb) {
  return this.deferred.promise.then(function(elem) {
    cb(elem);
  }, function(err) {
    errCb(err);
  });
};

PromiseChain.prototype.then = function(cb, errCb) {
  var p = new PromiseChain();

  this._then(function(elem) {
    p._complete(cb(elem));
  }, function(err) {
    errCb && !p._complete(errCb(err)) || p._fail(err);
  }).catch(function(err) {
    p._fail(err);
  });
  return p;
};

PromiseChain.prototype.catch = function(errCb) {
  var p = new PromiseChain();

  this._then(function(elem) {
    p._complete(elem);
  }, function(err) {
    p._complete(errCb(err));
  }).catch(function(err) {
    p._fail(err);
  });
  return p;
};

PromiseChain.prototype.init = function() {
  var p = new PromiseChain();

  return p;
};

PromiseChain.prototype.sleep = function(ms) {
  var p = new PromiseChain();
  this._then(function(elem) {
    Q.delay(ms).then(function() {
      p._complete(elem);
    }, function(err) {
      p._fail(err);
    });
  }, function(err) {
    p._fail(err);
  });
  return p;
};

PromiseChain.prototype.end = function(done) {
  this._then(function() {
    done();
  }, function(err) {
    done(err);
  });
};

PromiseChain.prototype.quit = function(done) {
  done();
};

PromiseChain.prototype._complete = function(val) {
  this.deferred.resolve(val);
};

PromiseChain.prototype._fail = function(err) {
  this.deferred.reject(err);
};

module.exports = {
  initPromiseChain: function() {
    return new PromiseChain();
  },
  addPromiseChainMethod: function(name, func) {
    var wrappedMethod = function() {
      var p = new PromiseChain();
      var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
      var that = this;
      this._then(function() {
        that.then(function() {
          return func.apply(that, args);
        }).then(function(elem) {
          p._complete(elem);
        }, function(err) {
          err = new Error('[ Webdriver Error: ' + name + '(' + args + ')=>'+ err.message +' ]');
          p._fail(err);
        });
      }, function(err) {
        p._fail(err);
      });
      return p;
    };
    PromiseChain.prototype[name] = wrappedMethod;
  }
};
