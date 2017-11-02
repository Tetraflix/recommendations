module.exports = {
  extends: "airbnb-base",
  env: {
    'es6': true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      'jsx': true
    }
  },
  rules: {
    'import/no-unresolved': 1,
    'comma-dangle': 1,
    'no-param-reassign': 1,
    'consistent-return': 1,
    'no-underscore-dangle': 1,
  }
};
