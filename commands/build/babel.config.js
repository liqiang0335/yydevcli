const print = require("../../utils/print");

/**
 * ----------------------------------------
 *  BabelOption
 * ----------------------------------------
 */
module.exports = function BabelOption({ browsers }) {
  print("browsers", browsers);
  const BabelEnv = ["@babel/env", { modules: "auto", targets: { browsers }, useBuiltIns: "usage", corejs: "3" }];

  const CommonPlugins = [
    "webpack-async-module-name",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-async-generator-functions",
    "@babel/plugin-proposal-nullish-coalescing-operator",
  ];

  return {
    common: { presets: [BabelEnv] },
    vue: {
      presets: [BabelEnv],
      plugins: [
        ...CommonPlugins,
        ["component", { libraryName: "element-ui", styleLibraryName: "theme-chalk" }],
        ["import", { libraryName: "vant", libraryDirectory: "es", style: true }],
      ],
    },
    react: {
      presets: [BabelEnv, ["@babel/preset-react", { runtime: "automatic" }]],
      plugins: [...CommonPlugins, ["import", { libraryName: "antd", libraryDirectory: "es", style: true }]],
    },
  };
};
