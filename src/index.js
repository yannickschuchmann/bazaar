const express = require('express');
const agenda = require('./worker');
const agendash = require('agendash');

const app = express();
app.listen(3000, function() {
  console.log('Example app listening on port http://localhost:3000/dash!');
});

app.get('/status', function(req, res) {
  res.json({status: 'ok'});
});
app.use('/dash', agendash(agenda));
