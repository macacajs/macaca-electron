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
    }),
    Buffer
  }
);

const mediaRecorders = [];
contextBridge.exposeInMainWorld(
  '_mediaRecorder', {
    _getMediaRecoders: () => {
      return mediaRecorders;
    },
    _startMediaRecorder: (filePath) => {
      desktopCapturer.getSources({
        types: [
          'screen',
          'window'
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
                  const buffer = Buffer.from(array);
                  writeFile(filePath, buffer, () => {
                    const index = mediaRecorders.findIndex(item => item.uuid === uuid);
                    if (index >= 0) {
                      mediaRecorders.splice(index, 1);
                    }
                  });
                });
              };
              mediaRecorders.push(mediaRecorder);
              mediaRecorder.start();
            });
        }
      });
    },
    _stopMediaRecorder: () => {
      mediaRecorders.forEach(mediaRecorder => mediaRecorder.stop());
    }
  }
);
