const BabelEnv = [
  "@babel/env",
  {
    modules: "auto",
    targets: { browsers: ["chrome >= 64"] },
    useBuiltIns: "usage",
    corejs: "3",
  },
];

const CommonPlugins = [
  "ynw",
  "webpack-async-module-name",
  "@babel/plugin-transform-runtime",
  "@babel/plugin-proposal-optional-chaining",
  "@babel/plugin-proposal-async-generator-functions",
  "@babel/plugin-proposal-nullish-coalescing-operator",
];

/**
 * ----------------------------------------
 * Exports
 * ----------------------------------------
 */
module.exports = {
  common: { presets: [BabelEnv] },
  vue: {
    presets: [BabelEnv],
    plugins: [
      ...CommonPlugins,
      [
        "component",
        { libraryName: "element-ui", styleLibraryName: "theme-chalk" },
      ],
      ["import", { libraryName: "vant", libraryDirectory: "es", style: true }],
    ],
  },
  react: {
    presets: [BabelEnv, "@babel/preset-react"],
    plugins: [
      ...CommonPlugins,
      ["import", { libraryName: "antd", libraryDirectory: "es", style: true }],
    ],
  },
};
