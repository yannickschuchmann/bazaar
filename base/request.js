const tr = require('tor-request');
const request = require('request');
const {password} = require('../tor_secret.json');
tr.TorControlPort.password = password;
tr.setTorAddress('localhost', 9050);

const ipCheckUrl = 'https://api.ipify.org';

const lib = {
  request: ({url, tor = true, ...options}) =>
    new Promise((resolve, reject) => {
      const req = tor ? tr.request : request;
      const attempts = 0;
      const repeat = () => {
        req(url, options, async (err, res, body) => {
          if (!err && res.statusCode === 200) {
            resolve({data: body});
          } else if (tor && attempts < 5) {
            attempts++;
            console.log(`${attempts}. attempt failed. Retrying ...`);
            await lib.renewIp();
            repeat();
          } else {
            reject(err);
          }
        });
      };
      repeat();
    }),
  renewIp: () =>
    new Promise((resolve, reject) => {
      console.log('Renewing IP address ...');
      request(ipCheckUrl, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          console.log('ACTUAL IP address: ', body);
        }
        tr.renewTorSession(err => {
          if (!err) {
            tr.request(ipCheckUrl, (err, res, body) => {
              if (!err && res.statusCode === 200) {
                console.log('NEW USED IP address: ', body);
              }
              resolve();
            });
          } else {
            reject(err);
          }
        });
      });
    }),
  wait: (from, to) => {
    const time = Math.floor(from + Math.random() * (to - from));
    console.log(`waiting for ${time}ms ...`);
    return new Promise(resolve => setTimeout(resolve, time));
  }
};

module.exports = lib;
