'use strict';

const _ = require('../lib/helper');

describe('helper', function() {
  it('wait for condition successfully', function *() {
    const start = Date.now();
    const sampleFn = () => {
      const now = Date.now();
      if (now - start >= 200) {
        return new Promise(function(res, _) {
          res(true);
        });
      } else {
        return new Promise(function(_, rej) {
          rej(false);
        });
      }
    };

    return _.waitForCondition(sampleFn, 500, 100).should.be.fulfilled();
  });

  it('wait for condition unsuccessfully', function *() {
    const sampleFn = () => {
      return new Promise(function(_, rej) {
        rej(false);
      });
    };

    return _.waitForCondition(sampleFn, 100, 500).should.be.rejected();
  });

  it('wait for condition returning false', function *() {
    const sampleFn = () => {
      return new Promise(function(res, _) {
        res(false);
      });
    };

    return _.waitForCondition(sampleFn, 100, 500).should.be.rejected();
  });
});
