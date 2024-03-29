module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
  },
};
