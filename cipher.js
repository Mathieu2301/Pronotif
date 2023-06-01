const crypto = require('crypto');

const hD = {};
const hE = {};

module.exports = function getCipher(key, salt, algorithm = 'aes-192-cbc') {
  if (!key || !algorithm || !salt) return {};

  return {
    decrypt(encrypted) {
      if (hD[encrypted]) return hD[encrypted];

      return new Promise((res) => {
        try {
          const decipher = crypto.createDecipheriv(
            algorithm,
            crypto.scryptSync(key, salt, 24),
            Buffer.alloc(16, 0),
          );

          let decrypted = '';
          decipher.on('readable', () => {
            let chunk;
            // eslint-disable-next-line no-cond-assign
            while ((chunk = decipher.read()) !== null) decrypted += chunk.toString('utf8');
          });

          decipher.on('end', () => {
            hD[encrypted] = decrypted;
            res(decrypted);
          });

          decipher.write(encrypted, 'hex');
          decipher.end();
        } catch (err) {
          console.log(`Can't decrypt "${encrypted}"`, err.message);
          res(encrypted);
        }
      });
    },

    encrypt(message) {
      if (hE[message]) return hE[message];

      return new Promise((res) => {
        try {
          const cipher = crypto.createCipheriv(
            algorithm,
            crypto.scryptSync(key, salt, 24),
            Buffer.alloc(16, 0),
          );

          let encrypted = '';
          cipher.on('readable', () => {
            let chunk;
            // eslint-disable-next-line no-cond-assign
            while ((chunk = cipher.read()) !== null) encrypted += chunk.toString('hex');
          });

          cipher.on('end', () => {
            hE[message] = encrypted;
            res(encrypted);
          });

          cipher.write(message);
          cipher.end();
        } catch (err) {
          console.log(`Can't encrypt "${message}"`, err.message);
          res(message);
        }
      });
    },
  };
};
