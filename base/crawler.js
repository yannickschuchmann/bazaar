const {request} = require('./request');

module.exports = class BaseCrawler {
  constructor({extractor, url, userAgent}) {
    this.extractor = extractor;
    this.url = url;
    this.userAgent = userAgent;
    this.request = request;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.request({
        tor: false,
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
