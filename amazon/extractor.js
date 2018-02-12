const BaseExtractor = require('../base/extractor');
const cheerio = require('cheerio');

class Extractor extends BaseExtractor {
  getPrice() {
    const $el = this.$productRow;
    let str = $el.find('.a-offscreen').text();
    if (!str) {
      str = $el.find('.s-price').text();
    }
    if (!str) {
      str = $el.find('.a-color-price').text();
    }
    if (!str) {
      str = $el.text();
    }

    const match = str.replace(',', '.').match(/(\d*[,.]\d{2})/g);
    if (match) {
      return parseFloat(match[0]);
    }
    return false;
  }

  getName() {
    return this.$productRow.find('h2').text();
  }

  getImageUrl() {
    return this.$productRow.find('img.s-access-image').attr('src');
  }
}

module.exports = Extractor;
