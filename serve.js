const http = require('http');
const socketio = require('socket.io');

const port = process.env.PORT || 500;

module.exports = (callback = () => null) => {
  const srv = http.createServer();

  srv.listen(port, () => console.log(`Listening on *:${port}`));
  callback(socketio(srv, { path: '/' }));
};
