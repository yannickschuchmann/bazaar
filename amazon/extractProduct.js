const cheerio = require('cheerio');
const fs = require('fs');

const isComplete = product => {
  return product.name && product.price && product.imageUrl;
};

const getPrice = $el => {
  let str = $el.find('.a-offscreen').text();
  if (!str) {
    str = $el.find('.s-price').text();
  }

  const match = str.replace(',', '.').match(/(\d*[,.]\d{1,2})/g);
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

  try {
    product = {
      priceAmazon: getPrice($productRow),
      name: getName($productRow),
      imageUrl: getImageUrl($productRow)
    };
  } catch (e) {
    console.error(e);
  }

  if (!isComplete(product)) {
    console.log('Product INCOMPLETE: Check HTML', product);
    fs.writeFile('incomplete.html', html, err => {
      if (err) throw err;

      console.log('HTML saved!');
    });
  }

  return product;
};

module.exports = extractProduct;
