const envGet = require('./env');

module.exports = {
  FIREBASE_CREDENTIALS: JSON.parse(envGet('FIREBASE_CREDENTIALS')),
  FIREBASE_DB: envGet('FIREBASE_DB'),

  PWD_PRIVATE_KEY: envGet('PWD_PRIVATE_KEY'),
  PWD_SALT: envGet('PWD_SALT'),

  PRODUCTION: envGet('PRODUCTION', 'false') === 'true',
  NOTIFICATIONS: envGet('NOTIFICATIONS', 'false') === 'true',

  CORR: (
    Number(envGet('CORR', false))
    || new Date().getTimezoneOffset() * 60 + 7200
  ) * 1000,
  PORT: Number(envGet('PORT', '3000')),
};
