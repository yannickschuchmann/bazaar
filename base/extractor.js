const cheerio = require('cheerio');
const fs = require('fs');

class BaseExtractor {
  constructor(html, product) {
    this.html = html;
    this.$ = cheerio.load(this.html);
    if (this.constructor == BaseExtractor) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  isComplete(product) {
    throw new Error('Method "isComplete()" Must be implemented');
  }

  getPrice() {
    throw new Error('Method "getPrice()" Must be implemented');
  }

  getName() {
    throw new Error('Method "getName()" Must be implemented');
  }

  getDetailUrl() {
    throw new Error('Method "getDetailUrl()" Must be implemented');
  }

  getImageUrl() {
    throw new Error('Method "getImageUrl()" Must be implemented');
  }

  extract() {
    this.$productRow = this.$('#result_0');
    let product;

    if (this.$productRow.length === 0) {
      console.log('No product row found.');
      return {};
    }

    return new Promise((resolve, reject) => {
      product = {
        priceAmazon: this.getPrice(),
        amazonUrl: this.getDetailUrl(),
        name: this.getName(),
        imageUrl: this.getImageUrl()
      };

      if (!this.isComplete(product)) {
        console.log('Product INCOMPLETE: Check HTML', product);
        fs.writeFile('incomplete.html', html, err => {
          if (err) throw err;

          console.log('HTML saved!');
          reject(new Error('Product incomplete'));
        });
      } else {
        resolve(product);
      }
    });
  }
}

module.exports = BaseExtractor;
