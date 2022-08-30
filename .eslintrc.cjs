const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8')
);

module.exports = {
  parser: '@babel/eslint-parser',
  extends: [
    'airbnb-base',
    'prettier',
  ],
  plugins: ['prettier'],
  env: {
    jest: true,
    node: true,
    es6: true,
  },
  rules: {
    'prettier/prettier': ['error', prettierOptions],
    'import/extensions': [2, 'always'], // To support  node native ESM
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
  },
};
