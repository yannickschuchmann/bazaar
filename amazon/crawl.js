const request = require('axios');
require('axios-debug-log');
const extractProduct = require('./extractProduct');

module.exports = ({userAgent, asin}) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      headers: {
        'user-agent': userAgent
      },
      url: `https://www.amazon.de/s/?keywords=${asin}&sort=price-asc-rank`
    })
      .then(async ({data}) => {
        let product;
        try {
          product = await extractProduct(data);
          resolve(product);
        } catch (e) {
          reject(e);
        }
      })
      .catch(e => {
        reject(e);
      });
  });
};
