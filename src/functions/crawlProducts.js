const randomUA = require('random-fake-useragent');
const BaseCrawler = require('../../libs/base/crawler');
const {renewIp, wait} = require('../../libs/base/request');
const AmazonExtractor = require('../../libs/amazon/extractor');
const GeizhalsExtractor = require('../../libs/geizhals/extractor');
const GeizhalsCrawler = require('../../libs/geizhals/crawler');

const admin = require('../config/firebase');
const db = admin.firestore();

const getUserAgent = () => {
  // get rid of opera
  const browserTypes = ['Chrome', 'Internet Explorer', 'Firefox', 'Safari'];
  const index = Math.floor(Math.random() * 4);
  return randomUA.getRandom(browserTypes[index]);
};

const crawl = async doc => {
  const userAgent = getUserAgent();
  const data = doc.data();
  const {asin, ean} = data;
  const crawls = data.crawls || [];

  await renewIp();
  console.log('User-Agent: ', userAgent);
  console.log(`Crawling ASIN: ${asin}, EAN: ${ean} ..`);
  return new Promise(async (resolve, reject) => {
    const crawlerAmazon = new BaseCrawler({
      extractor: AmazonExtractor,
      url: `https://www.amazon.de/s/?keywords=${asin}&sort=price-asc-rank`,
      userAgent
    });
    const crawlerGeizhals = new GeizhalsCrawler({
      extractor: GeizhalsExtractor,
      url: `https://geizhals.de/?fs=${asin}`,
      userAgent
    });
    const amazon = await crawlerAmazon.run();
    const geizhals = await crawlerGeizhals.run();

    resolve({
      crawls: [
        {
          ...geizhals,
          ...amazon,
          timestamp: Date.now()
        },
        ...crawls.slice(0, 4)
      ]
    });
  });
};

module.exports = async (event, context, callback) => {
  const products = [];
  const snapshot = await db
    .collection('products')
    .orderBy('ean', 'desc')
    // .limit(1)
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
    // if (typeof productData.priceAmazon !== 'undefined') {
    //   run();
    //   return;
    // }

    const asin = productData.asin;
    crawl(product)
      .then(async result => {
        console.log('------------------------------------------------------');
        console.log(result);
        console.log('------------------------------------------------------');
        console.log(`Crawled ${productData.ean}`);

        console.log(`DATABASE: Updating ${asin} ..`);
        await db
          .collection('products')
          .doc(product.id)
          .update(result);
        console.log(`DATABASE: Updated.\n`);

        await wait(750, 2000);
        run();
      })
      .catch(async e => {
        console.log(e);
        await wait(750, 2000);
        run();
      });
  };
  run();
};
