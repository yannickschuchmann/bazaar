const cheerio = require('cheerio');
const fs = require('fs');

const isComplete = product => {
  return product.name && product.priceAmazon && product.imageUrl;
};

const getPrice = $el => {
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
};

const getName = $el => {
  return $el.find('h2').text();
};

const getImageUrl = $el => {
  return $el.find('img.s-access-image').attr('src');
};

const extractProduct = html => {
  const $ = cheerio.load(html);
  const $productRow = $('#result_0');
  let product;

  if ($productRow.length === 0) {
    console.log('No product row found.');
    return {
      priceAmazon: null,
      name: null,
      imageUrl: null
    };
  }

  return new Promise((resolve, reject) => {
    product = {
      priceAmazon: getPrice($productRow),
      name: getName($productRow),
      imageUrl: getImageUrl($productRow)
    };

    if (!isComplete(product)) {
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
};

module.exports = extractProduct;
