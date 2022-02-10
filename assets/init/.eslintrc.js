module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended"],
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  globals: {
    echarts: true,
    wx: true,
    Loca: true,
    AMap: true,
    BMap: true,
  },
  plugins: ["react-hooks"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
    },
  },
  rules: {
    semi: 2,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "off",
    "no-unused-vars": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "no-irregular-whitespace": "off",
    "react/jsx-no-target-blank": "off",
    "no-console": "warn",
  },
};
