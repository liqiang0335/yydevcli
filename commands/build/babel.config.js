const print = require("../../utils/print");

/**
 * ----------------------------------------
 *  BabelOption
 * ----------------------------------------
 */
module.exports = function BabelOption(ctx) {
  const { browsers, antd } = ctx;
  print("browsers", browsers);
  const BabelEnv = ["@babel/env", { modules: "auto", targets: { browsers }, useBuiltIns: "usage", corejs: "3" }];

  const CommonPlugins = [
    "webpack-async-module-name",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-async-generator-functions",
    "@babel/plugin-proposal-nullish-coalescing-operator",
  ];

  const ret = {
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
      plugins: [...CommonPlugins],
    },
  };

  if (antd === "4") {
    console.log("antd 4: add import plugin");
    ret.react.plugins.push(["import", { libraryName: "antd", libraryDirectory: "es", style: true }]);
  }

  return ret;
};
