const BaseExtractor = require('../base/extractor');
const cheerio = require('cheerio');
const fs = require('fs');

class Extractor extends BaseExtractor {
  isComplete(product) {
    return product.priceGeizhals;
  }

  extract() {
    const $ = cheerio.load(this.html);
    this.$productRow = $('#gh_content_wrapper');
    let product;

    if (this.$productRow.length === 0) {
      console.log('No product row found.');
      return {
        priceGeizhals: null,
        offerUrl: null,
        name: null,
        imageUrl: null
      };
    }

    return new Promise((resolve, reject) => {
      product = {
        imageUrl: this.getImageUrl(),
        name: this.getName(),
        offerUrl: this.getOfferUrl(),
        priceGeizhals: this.getPrice()
      };

      if (!this.isComplete(product)) {
        console.log('Product INCOMPLETE: Check HTML', product);
        fs.writeFile('incompleteGeizhals.html', this.html, err => {
          if (err) throw err;

          console.log('HTML saved!');
          resolve({});
        });
      } else {
        resolve(product);
      }
    });
  }

  getOfferUrl() {
    return (
      'https://geizhals.de' +
      this.$productRow.find('.offerlist .offer .offer__clickout a').attr('href')
    );
  }

  getPrice() {
    const $el = this.$productRow;
    let str = $el.find('.offerlist .offer .offer__price .gh_price').text();

    const match = str.replace(',', '.').match(/(\d*[,.]\d{2})/g);
    if (match) {
      return parseFloat(match[0]);
    }
    return false;
  }

  getName() {
    return (
      this.$productRow.find('.arthdr span[itemprop="name"]').text() || undefined
    );
  }

  getImageUrl() {
    return this.$productRow.find('#gh_prodImg').attr('src');
  }
}

module.exports = Extractor;
