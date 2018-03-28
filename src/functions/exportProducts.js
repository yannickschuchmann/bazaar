const admin = require('../config/firebase');
const db = admin.firestore();

const getPriceDelta = ({priceAmazon, priceGeizhals}) =>
  priceAmazon && priceGeizhals ? priceGeizhals - priceAmazon : '';

const getSalesRank = ({salesRank = []}) =>
  salesRank.map(({rank, category}) => `${rank} in ${category}`).join(',');

const normalize = crawl => ({
  ...crawl,
  priceDelta: getPriceDelta(crawl),
  salesRank: getSalesRank(crawl)
});

module.exports = async (event, context, callback) => {
  const snapshot = await db
    .collection('products')
    .orderBy('ean', 'asc')
    .limit(1)
    .get();

  const products = [];
  const headers = [
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

  snapshot.forEach(doc => {
    const {crawls = [], ...record} = doc.data();
    const latestCrawl = crawls[0] ? normalize(crawls[0]) : {};
    products.push({
      ...record,
      ...latestCrawl
    });
  });

  console.log(products[0]);

  callback();
};
