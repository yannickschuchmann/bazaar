const request = require('axios');
require('axios-debug-log');

const extractProduct = require('./amazon/extractProduct');
const randomUA = require('random-fake-useragent');

module.exports = (event, context, callback) => {
  const EAN = '4005556126606';
  const userAgent = randomUA.getRandom();
  if (process.env.DEBUG) {
    console.log('Scraping: ', EAN);
    console.log('User-Agent: ', userAgent);
  }

  request({
    method: 'get',
    headers: {
      'user-agent': userAgent
    },
    url: `https://www.amazon.de/s/?keywords=${EAN}&sort=price-asc-rank`
  })
    .then(({data}) => {
      const product = extractProduct(EAN)(data);
      callback(null, {product});
    })
    .catch(error => {
      console.log(error);
    });
};
