module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-env"],
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:prettier/recommended",
  ],
  plugins: ["prettier"],
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    "prettier/prettier": "error",
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/no-absolute-path": "error",
    "no-unused-vars": ["warn"],
  },
};
