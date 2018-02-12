const randomUA = require('random-fake-useragent');
const Crawler = require('./base/crawler');
const AmazonExtractor = require('./amazon/extractor');

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
  const {asin} = doc.data();
  // asin = 'B001GKQ76O';
  console.log('User-Agent: ', userAgent);
  console.log(`Crawling ASIN: ${asin} ..`);
  return new Promise(async (resolve, reject) => {
    const crawlerAmazon = new Crawler({
      extractor: AmazonExtractor,
      url: `https://www.amazon.de/s/?keywords=${asin}&sort=price-asc-rank`,
      userAgent
    });
    const amazon = await crawlerAmazon.run();
    // const geizhals = await crawlGeizhals({asin, userAgent});

    resolve({
      ...amazon,
      // ...geizhals,
      timestamp: Date.now()
    });
  });
};

module.exports = async (event, context, callback) => {
  const products = [];
  const snapshot = await db
    .collection('products')
    .orderBy('asin', 'desc')
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
