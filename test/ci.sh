Xvfb -ac -screen scrn 1280x2000x24 :9.0 &

export DISPLAY=:9.0

sleep 3

npm run test

npm install coveralls@2 && cat ./coverage/lcov.info | coveralls
