const request = require('axios');
const cheerio = require('cheerio');
require('axios-debug-log');
const BaseCrawler = require('../base/crawler');

module.exports = class Crawler extends BaseCrawler {
  run() {
    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        headers: {
          'user-agent': this.userAgent
        },
        url: this.url
      })
        .then(async ({data}) => {
          const $ = cheerio.load(data);
          const productUrl =
            'https://geizhals.de/' +
            $('#gh_content_wrapper table td a ').attr('href');
          if (!productUrl) {
            resolve({});
          } else {
            request({
              method: 'get',
              headers: {
                'user-agent': this.userAgent
              },
              url: productUrl
            }).then(async ({data}) => {
              try {
                const extractor = new this.extractor(data);
                const product = await extractor.extract();
                resolve(product);
              } catch (e) {
                reject(e);
              }
            });
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }
};
