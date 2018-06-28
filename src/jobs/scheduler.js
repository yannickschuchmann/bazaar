module.exports = function(agenda) {
  agenda.define('schedule crawl', (job, done) => {
    console.log('Scheduled crawl');
    return done();
  });
};
