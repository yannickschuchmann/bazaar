const request = require('axios');
require('axios-debug-log');
const extractProduct = require('./amazon/extractProduct');
const randomUA = require('random-fake-useragent');

const admin = require('./firebase');
const db = admin.firestore();

const crawl = doc => {
  const userAgent = randomUA.getRandom();
  const ASIN = doc.data().asin;
  if (process.env.DEBUG) {
    console.log('Scraping: ', ASIN);
    console.log('User-Agent: ', userAgent);
  }

  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      headers: {
        'user-agent': userAgent
      },
      url: `https://www.amazon.de/s/?keywords=${ASIN}&sort=price-asc-rank`
    })
      .then(({data}) => {
        const product = extractProduct(data);
        product.timestamp = Date.now();
        resolve(product);
      })
      .catch(error => {
        throw error;
      });
  });
};

module.exports = async (event, context, callback) => {
  const products = [];
  const snapshot = await db
    .collection('products')
    .limit(2)
    .get();

  snapshot.forEach(doc => products.push(doc));

  const run = () => {
    // Terminate after last product
    if (products.length === 0) {
      console.log('SUCCESS');
      callback(null, event);
      return;
    }

    const product = products.pop();
    const ean = product.data().ean;

    console.log(`Start new Request for ${ean}`);
    crawl(product).then(async result => {
      console.log(`${ean} crawled`);

      console.log(`Updating ${ean} ..`);
      await db
        .collection('products')
        .doc(product.id)
        .update(result);
      console.log(`Saved ${ean}.`);

      run();
    });
  };
  run();
};
