const request = require('axios');
require('axios-debug-log');

module.exports = class BaseCrawler {
  constructor({extractor, url, userAgent}) {
    this.extractor = extractor;
    this.url = url;
    this.userAgent = userAgent;
  }

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
          let product;
          try {
            const extractor = new this.extractor(data);
            product = await extractor.extract();
            resolve(product);
          } catch (e) {
            reject(e);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }
};
