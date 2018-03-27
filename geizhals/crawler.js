const cheerio = require('cheerio');
const {wait} = require('../base/request');
const BaseCrawler = require('../base/crawler');

class Crawler extends BaseCrawler {
  run() {
    return new Promise(async (resolve, reject) => {
      try {
        // get search results
        await wait(750, 2000);
        const {data: searchResultsHtml} = await this.request({
          method: 'get',
          headers: {
            'user-agent': this.userAgent
          },
          url: this.url
        });

        // find url to detail page of search result entry
        const $ = cheerio.load(searchResultsHtml);
        const path = $('#gh_content_wrapper table td a ').attr('href');

        // if no search results
        if (!path) {
          resolve({});
          return;
        }

        const productUrl = 'https://geizhals.de/' + path;

        // otherwise crawl detail page of search result entry
        await wait(750, 2000);
        const {data: detailHtml} = await this.request({
          method: 'get',
          headers: {
            'user-agent': this.userAgent
          },
          url: productUrl
        });

        const extractor = new this.extractor(detailHtml);
        const product = await extractor.extract();
        await wait(750, 2000);
        resolve(product);
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = Crawler;
