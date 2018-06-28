const Agenda = require('agenda');
const mongoConnectionString = 'mongodb://127.0.0.1/agenda';

const agenda = new Agenda({db: {address: mongoConnectionString}});

require('./jobs/scheduler')(agenda);

(async function() {
  agenda.on('ready', function() {
    agenda.every('1 minute', 'schedule crawl');
    agenda.start();
  });
})();

module.exports = agenda;
