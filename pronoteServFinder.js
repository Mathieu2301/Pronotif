const https = require('https');
const qs = require('query-string');

module.exports = function getServs(lat, long, cb) {
  const rq = https.request({
    method: 'POST',
    hostname: 'www.index-education.com',
    path: '/swie/geoloc.php',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }, (res) => {
    let data = '';

    res.on('data', (d) => data = data + d.toString());
    res.on('end', () => {
      try {
        data = JSON.parse(data);
      } catch (_) {
        console.error('Parsing error', data);
        return cb({ error: 'Impossible de récupérer la liste des établissements' });
      }

      cb({ success: true, data });
    });
  });

  rq.write(qs.stringify({
    data: JSON.stringify({
      nomFonction: 'geoLoc',
      lat, long,
    }),
  }));
  rq.end();
}
