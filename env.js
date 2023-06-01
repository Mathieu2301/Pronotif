const fs = require('fs');

const envFilePaths = [
  require.main.path,
  process.env.PWD,
  process.env.INIT_CWD,
];

const envFiles = [];
for (const path of envFilePaths) {
  if (!envFiles.includes(`${path}/.env`)) envFiles.push(`${path}/.env`);
}

for (const envFile of envFiles) {
  if (!fs.existsSync(envFile)) continue;
  fs.readFileSync(envFile, 'utf8')
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('='))
    .forEach(([key, ...value]) => {
      process.env[key] = value.join('=');
    });
  console.log(`Loaded env file: '${envFile}'`);
}

/**
 * Get an environment variable.
 * @param {string} key The environment variable key.
 * @param {string} defVal The default value.
 */
const get = (key, defVal = undefined) => {
  const value = process.env[key] ?? defVal;
  if (value === undefined) {
    console.error(`Missing environment variable '${key}'`);
    process.exit(1);
  }
  return value;
};

module.exports = get;
