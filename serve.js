const express = require('express');
const port = process.env.PORT || 500;

module.exports = (callback = (io = require('socket.io')()) => null) => {
  const app = express();
  const http = require('http').createServer(app);

  if (require('fs').existsSync('dist')) app.use(express.static('dist'));

  http.listen(port, () => console.log(`Listening on *:${port}`));
  callback(require('socket.io')(http, { path: '/' }));
};
