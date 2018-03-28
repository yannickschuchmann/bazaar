const BaseExtractor = require('../base/extractor');
const cheerio = require('cheerio');

class Extractor extends BaseExtractor {
  isComplete(product) {
    return product.name && product.priceAmazon && product.imageUrl;
  }

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

  getDetailUrl() {
    return this.$productRow.find('a.a-link-normal').attr('href');
  }

  getImageUrl() {
    return this.$productRow.find('img.s-access-image').attr('src');
  }

  getSalesRank() {
    const rankAndCategory = /((?:.?\d+)*)(?: in )(.*)/;
    const textPerCategory = this.$('#SalesRank td.value')
      .text()
      .split('Nr. ')
      .map(str =>
        str
          .replace(String.fromCharCode(160), ' ')
          .replace(/\s\s+/g, ' ')
          .trim()
      )
      .filter(str => str.length > 0);

    return textPerCategory.map(txt => {
      const match = txt.match(rankAndCategory) || {};
      return {
        rank: parseInt(match[1].replace('.', '')),
        category: match[2]
      };
    });
  }
}

module.exports = Extractor;
