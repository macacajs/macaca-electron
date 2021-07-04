'use strict';

delete window.exports;
delete window.module;

const _ = require('lodash');
const { writeFile } = require('fs');
const {
  ipcRenderer, shell, remote,
  clipboard, desktopCapturer
} = require('electron');
const Buffer = require('buffer').Buffer;

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

window._electron_bridge = window._electron_bridge || {
  fs: {
    writeFile
  },
  ipcRenderer,
  shell,
  remote,
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
  }),
  Buffer
};

window._mediaRecorders = window._mediaRecorders || [];

window._startMediaRecorder = (filePath) => {
  window._electron_bridge.desktopCapturer.getSources({
    types: [
      'screen',
      'window',
    ]
  }).then(sources => {
    for (const source of sources) {
      const constraints = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id
          }
        }
      };
      const mimeType = 'video/webm; codecs=vp9';
      const recordedChunks = [];
      window.navigator
        .mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          const uuid = filePath;
          const mediaRecorder = new window.MediaRecorder(stream, {
            mimeType
          });
          mediaRecorder.uuid = uuid;
          mediaRecorder.ondataavailable = ({ data }) => {
            recordedChunks.push(data);
          };
          mediaRecorder.onstop = () => {
            const blob = new window.Blob(recordedChunks, {
              type: mimeType
            });
            blob.arrayBuffer().then(array => {
              const buffer = window._electron_bridge.Buffer.from(array);
              window._electron_bridge.fs.writeFile(filePath, buffer, () => {
                const index = window._mediaRecorders.findIndex(item => item.uuid === uuid);
                if (index >= 0) {
                  window._mediaRecorders.splice(index, 1);
                }
              });
            });
          };
          window._mediaRecorders.push(mediaRecorder);
          mediaRecorder.start();
        });
    }
  });
};

window._stopMediaRecorder = () => {
  window._mediaRecorders.forEach(mediaRecorder => mediaRecorder.stop());
};
