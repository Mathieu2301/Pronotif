const https = require('https');

module.exports = (user, cb) => {
  const req = https.request({
    method: 'POST',
    hostname: 'api.qr-code-generator.com',
    path: '/v1/create?access-token=EBephxedmZHs9OWzR2Kbv-125ifulLI1LemyW4NO2hwWifAzpHadEVcOq-OkFtNz',
    headers: {
      'Content-Type': 'application/json',
    },
  }, (res) => {
    const chunks = [];

    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      cb(
        Buffer.concat(chunks)
          .toString()
          .replace(
            /( xml(.*?)"(.*?)")|( version(.*?)"(.*?)")|( id(.*?)"(.*?)")|( fill(.*?)"(.*?)")/g,
            '',
          )
          .replace(/<r.*?>/i, ''),
      );
    });

    res.on('error', (error) => {
      console.error(error);
    });
  });

  req.end(JSON.stringify({
    qr_code_text: `http://pronotif.fr/addFriend/${user}`,
    image_format: 'SVG',
    background_color: '#000000',
    marker_left_template: 'version11',
    marker_right_template: 'version11',
    marker_bottom_template: 'version11',
    qr_code_logo: 'account11314567/logo/fd443fa78e05315d104d5e30674baa20.png',
    qr_code_pattern: 'connect-horizontal',
  }));
};
