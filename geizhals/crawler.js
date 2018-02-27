const request = require('axios');
const cheerio = require('cheerio');
require('axios-debug-log');
const BaseCrawler = require('../base/crawler');

class Crawler extends BaseCrawler {
  run() {
    return new Promise(async (resolve, reject) => {
      try {
        // get search results
        const {data: searchResultsHtml} = await request({
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
        const {data: detailHtml} = await request({
          method: 'get',
          headers: {
            'user-agent': this.userAgent
          },
          url: productUrl
        });

        const extractor = new this.extractor(detailHtml);
        const product = await extractor.extract();
        resolve(product);
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = Crawler;
