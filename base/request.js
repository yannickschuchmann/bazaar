const tr = require('tor-request');
const request = require('request');
const {password} = require('../tor_secret.json');
tr.TorControlPort.password = password;
tr.setTorAddress('localhost', 9050);

const ipCheckUrl = 'https://api.ipify.org';

const lib = {
  request: ({url, tor = true, ...options}) =>
    new Promise((resolve, reject) => {
      let attempts = 0;
      const repeat = () => {
        const req = tor ? tr.request : request;
        console.log('Request: ', url);
        req(url, options, async (err, res, body) => {
          if (!err && res.statusCode === 200) {
            resolve({data: body});
          } else if (attempts < 5) {
            attempts++;
            console.log(`${attempts}. attempt failed. Retrying ...`);
            if (tor) {
              await lib.renewIp();
            } else {
              tor = true;
            }
            repeat();
          } else {
            console.log('ERROR: ', err, body);
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
