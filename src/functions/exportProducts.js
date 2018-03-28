const fs = require('fs-extra');

const Json2csvParser = require('json2csv').Parser;
const fields = [
  'asin',
  'ean',
  'category',
  'name',
  'imageUrl',
  'amazonUrl',
  'salesRank',
  'priceAmazon',
  'priceGeizhals',
  'priceDelta',
  'offerUrl',
  'timestamp'
];
const json2csvParser = new Json2csvParser({fields});

const admin = require('../config/firebase');
const db = admin.firestore();

const h = {
  getPriceDelta: ({priceAmazon, priceGeizhals}) =>
    priceAmazon && priceGeizhals ? priceGeizhals - priceAmazon : '',
  getSalesRank: ({salesRank = []}) =>
    salesRank.map(({rank, category}) => `${rank} in ${category}`).join(','),
  normalize: crawl => ({
    ...crawl,
    priceDelta: h.getPriceDelta(crawl),
    salesRank: h.getSalesRank(crawl)
  })
};

module.exports = async (event, context, callback) => {
  const products = [];
  const snapshot = await db
    .collection('products')
    .orderBy('ean', 'asc')
    .get();

  snapshot.forEach(doc => {
    const {crawls = [], ...record} = doc.data();
    const latestCrawl = crawls[0] ? h.normalize(crawls[0]) : {};
    products.push({
      ...record,
      ...latestCrawl
    });
  });

  const csv = json2csvParser.parse(products);
  const path = `./exports/products_${Date.now()}.csv`;
  try {
    await fs.outputFile(path, csv, 'utf8');
    console.log(`Saved to ${path}`);
  } catch (err) {
    console.error(err);
  }

  callback();
};
