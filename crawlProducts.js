const request = require('axios');
require('axios-debug-log');
const extractProduct = require('./amazon/extractProduct');
const randomUA = require('random-fake-useragent');

const admin = require('./firebase');
const db = admin.firestore();

const getUserAgent = () => {
  // get rid of opera
  const browserTypes = ['Chrome', 'Internet Explorer', 'Firefox', 'Safari'];
  const index = Math.floor(Math.random() * 4);
  return randomUA.getRandom(browserTypes[index]);
};

const crawl = doc => {
  const userAgent = getUserAgent();
  const ASIN = doc.data().asin;
  console.log('User-Agent: ', userAgent);
  console.log(`Crawling ASIN: ${ASIN} ..`);
  return new Promise((resolve, reject) => {
    request({
      method: 'get',
      headers: {
        'user-agent': userAgent
      },
      url: `https://www.amazon.de/s/?keywords=${ASIN}&sort=price-asc-rank`
    })
      .then(async ({data}) => {
        let product;
        try {
          product = await extractProduct(data);
          product.timestamp = Date.now();
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

module.exports = async (event, context, callback) => {
  const products = [];
  const snapshot = await db
    .collection('products')
    .orderBy('asin', 'desc')
    .get();

  snapshot.forEach(doc => products.push(doc));

  console.log(`Products total: ${snapshot.docs.length}`);
  const run = () => {
    // Terminate after last product
    if (products.length === 0) {
      console.log('SUCCESS');
      callback(null, event);
      return;
    }
    const product = products.pop();
    const productData = product.data();

    // skip already crawled products
    if (typeof productData.priceAmazon !== 'undefined') {
      run();
      return;
    }

    const asin = productData.asin;
    const waitTime = Math.floor(Math.random() * 1250 + 750);
    crawl(product)
      .then(async result => {
        console.log('------------------------------------------------------');
        console.log(result);
        console.log('------------------------------------------------------');
        console.log('Crawled');

        console.log(`DATABASE: Updating ${asin} ..`);
        await db
          .collection('products')
          .doc(product.id)
          .update(result);
        console.log(`DATABASE: Updated.\n`);

        setTimeout(() => {
          run();
        }, waitTime);
      })
      .catch(e => {
        console.log(e);
        setTimeout(() => {
          run();
        }, waitTime);
      });
  };
  run();
};
