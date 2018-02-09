const admin = require('firebase-admin');
const firebaseCreds = require('./firebase_secret.json');

admin.initializeApp({
  credential: admin.credential.cert(firebaseCreds),
  databaseURL: 'https://bazaar-194716.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'importer-da39a3ee5e6b4b0d3255bfef95601890afd80709'
  }
});

module.exports = admin;
