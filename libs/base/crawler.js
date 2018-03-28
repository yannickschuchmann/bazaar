const {request} = require('./request');
const {wait} = require('./request');

module.exports = class BaseCrawler {
  constructor({extractor, url, userAgent}) {
    this.extractor = extractor;
    this.url = url;
    this.userAgent = userAgent;
    this.request = request;
  }

  run() {
    return new Promise(async (resolve, reject) => {
      const {data} = await this.request({
        tor: false,
        method: 'get',
        headers: {
          'user-agent': this.userAgent
        },
        url: this.url
      });
      let product;
      try {
        const extractor = new this.extractor(data);
        product = await extractor.extract();
        if (product.amazonUrl) {
          await wait(750, 2000);
          const {data: detailHtml} = await this.request({
            tor: false,
            method: 'get',
            headers: {
              'user-agent': this.userAgent
            },
            url: product.amazonUrl
          });
          const detailExtractor = new this.extractor(detailHtml);
          const salesRank = detailExtractor.getSalesRank();
          if (salesRank) {
            product.salesRank = salesRank;
          }
        }
        resolve(product);
      } catch (e) {
        reject(e);
      }
    });
  }
};
