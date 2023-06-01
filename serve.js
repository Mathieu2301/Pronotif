const http = require('http');
const socketio = require('socket.io');
const config = require('./config');

module.exports = (callback = () => null) => {
  const srv = http.createServer();

  srv.listen(config.PORT, () => console.log(`Listening on *:${config.PORT}`));
  callback(socketio(srv, { path: '/' }));
};
