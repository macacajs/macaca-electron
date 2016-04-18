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

const co = require('co');
const getAtom = require('selenium-atoms').getByName;
const errors = require('webdriver-dfn-error-code').errors;
const getErrorByCode = require('webdriver-dfn-error-code').getErrorByCode;

const _ = require('./helper');

const ELEMENT_OFFSET = 1000;

const implicitWaitForCondition = function(func) {
  return _.waitForCondition(func, this.implicitWaitMs);
};

const sendCommand = function *(type, args) {

  let result = yield this.send({
    action: type,
    args: args
  });
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch (e) {
      throw new errors.UnknownError(e.message);
    }
  }
  const code = result.status;
  const value = result.value;

  if (code === 0) {
    return value;
  } else {
    const errorName = getErrorByCode(code);
    const errorMsg = value && value.message;
    throw new errors[errorName](errorMsg);
  }
};

const sendJSCommand = function *(atom, args) {
  const command = `(${getAtom(atom)})(${args.map(JSON.stringify).join(',')})`;
  return yield sendCommand.call(this, 'js', command);
};

const convertAtoms2Element = function(atoms) {
  const atomsId = atoms && atoms.ELEMENT;

  if (!atomsId) {
    return null;
  }

  const index = this.atoms.push(atomsId) - 1;

  return {
    ELEMENT: index + ELEMENT_OFFSET
  };
};

const convertElement2Atoms = function(elementId) {
  if (!elementId) {
    return null;
  }

  let atomsId;

  try {
    atomsId = this.atoms[parseInt(elementId, 10) - ELEMENT_OFFSET];
  } catch (e) {
    return null;
  }

  return {
    ELEMENT: atomsId
  };
};

const findElementOrElements = function *(strategy, selector, ctx, many) {
  let result;
  const that = this;

  const atomsElement = convertElement2Atoms.call(this, ctx);

  function *search() {
    result = yield sendJSCommand.call(that, `find_element${many ? 's' : ''}`, [strategy, selector, atomsElement]);
    return _.size(result) > 0;
  }

  try {
    yield implicitWaitForCondition.call(this, co.wrap(search));
  } catch (err) {
    result = [];
  }

  if (many) {
    return result.map(convertAtoms2Element.bind(this));
  } else {
    if (!result || _.size(result) === 0) {
      throw new errors.NoSuchElement();
    }
    return convertAtoms2Element.call(this, result);
  }
};

const controllers = {};

controllers.click = function *(elementId) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  return yield sendJSCommand.call(this, 'click', [atomsElement]);
};

controllers.findElement = function *(strategy, selector, ctx) {
  return yield findElementOrElements.call(this, strategy, selector, ctx, false);
};

controllers.findElements = function *(strategy, selector, ctx) {
  return yield findElementOrElements.call(this, strategy, selector, ctx, true);
};

controllers.getText = function *(elementId) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  return yield sendJSCommand.call(this, 'get_text', [atomsElement]);
};

controllers.clearText = function *(elementId) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  return yield sendJSCommand.call(this, 'clear', [atomsElement]);
};

controllers.setValue = function *(elementId, value) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  yield sendJSCommand.call(this, 'click', [atomsElement]);
  return yield sendJSCommand.call(this, 'type', [atomsElement, value]);
};

controllers.isDisplayed = function *(elementId) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  return yield sendJSCommand.call(this, 'is_displayed', [atomsElement]);
};

controllers.getAttribute = function *(elementId, attrName) {
  const atomsElement = convertElement2Atoms.call(this, elementId);
  return yield sendJSCommand.call(this, 'get_attribute_value', [atomsElement, attrName]);
};

controllers.title = function *() {
  return yield this.execute('return document.title;');
};

controllers.execute = function *(script, args) {
  if (!args) {
    args = [];
  }

  // args = args.map(arg => {
  //   if (arg.ELEMENT) {
  //     return convertElement2Atoms.call(this, arg.ELEMENT);
  //   } else {
  //     return arg;
  //   }
  // });

  const value = yield sendJSCommand.call(this, 'execute_script', [script, args]);

  if (Array.isArray(value)) {
    return value.map(convertAtoms2Element.bind(this));
  } else {
    return value;
  }
};

controllers.url = function *() {
  return yield sendCommand.call(this, 'url');
};

controllers.get = function *(url) {
  return yield sendCommand.call(this, 'get', { url: url });
};

controllers.forward = function *() {
  throw new errors.NotImplementedError();
};

controllers.back = function *() {
  return yield this.execute('history.back()');
};

controllers.getWindows = function *() {
  return yield sendCommand.call(this, 'getWindows');
};

controllers.setWindowSize = function *(windowHandle, width, height) {
  return yield sendCommand.call(this, 'setWindowSize', {
    windowHandle, width, height
  });
};

controllers.maximize = function *(windowHandle) {
  return yield sendCommand.call(this, 'maximize', {
    windowHandle
  });
};

controllers.refresh = function *() {
  return yield this.execute('location.reload()');
};

controllers.getSource = function *() {
  const cmd = 'return document.getElementsByTagName("html")[0].outerHTML';
  return yield this.execute(cmd);
};

controllers.getScreenshot = function *() {
  return yield sendCommand.call(this, 'getScreenshot');
};

controllers.getComputedCss = function *(elementId, propertyName) {
  return yield this.execute('return window.getComputedStyle(arguments[0], null).getPropertyValue(arguments[1]);', [convertElement2Atoms.call(this, elementId), propertyName]);
};

module.exports = controllers;
