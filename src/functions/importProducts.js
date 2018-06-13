const GoogleSpreadsheet = require('google-spreadsheet');
const driveCreds = require('../config/drive_secret.json');

const admin = require('../config/firebase');
const db = admin.firestore();
const BATCH_LIMIT = 500;

const isValidEvent = event => {
  return typeof event == 'object' && event.category && event.spreadsheetId;
};

module.exports = (event, context, callback) => {
  if (!isValidEvent(event)) {
    throw new Error('No valid Event passed. Cancelled');
  }

  let batch = db.batch();
  const doc = new GoogleSpreadsheet(event.spreadsheetId);

  doc.useServiceAccountAuth(driveCreds, err => {
    doc.getRows(1, function(err, rows) {
      if (err) {
        throw err;
      }

      rows.forEach(async (row, index) => {
        if (row.ean) {
          const ref = db.collection('products').doc(row.ean);
          batch.set(ref, {
            ean: row.ean,
            asin: row.asin,
            category: event.category,
            cat1_rank: row.cat1rank,
            catx_rank: row.catxrank,
            searchrank: (row.searchrank || '0').trim()
          });
        }

        console.log(index);
        if ((index + 1) % BATCH_LIMIT === 0) {
          console.log(`BATCH_LIMIT: ${BATCH_LIMIT} reached. Committing batch`);
          batch.commit();
          batch = db.batch();
        }
      });
      console.log('Done with batch writing. Committing batch');
      batch.commit().then(() => {
        console.log('SUCCESS');
        callback(null, event);
      });
    });
  });
};
