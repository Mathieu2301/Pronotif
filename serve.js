const express = require('express');
const fs = require('fs');

module.exports = (callback = (io = require('socket.io')()) => null) => {
  if (!fs.existsSync('/home/main/config/SSL/private.key') || !fs.existsSync('/home/main/config/SSL/certificate.crt')) return;

  const app = express();
  const https = require('https').createServer({
    key: fs.readFileSync('/home/main/config/SSL/private.key'),
    cert: fs.readFileSync('/home/main/config/SSL/certificate.crt')
  }, app);

  // app.use(express.static('dist'));

  https.listen(500, () => console.log('Listening on *:500'));

  callback(require('socket.io')(https));
};
