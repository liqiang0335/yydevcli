const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelOptions = require("./babel.config");
const print = require("../../utils/print");
/**
 * ----------------------------------------
 * WEBPACK CONFIG
 * ----------------------------------------
 */
module.exports = function (userOption, ctx) {
  const hash = userOption["@hash"] || {};
  const themeVars = userOption["@themeVars"] || {};
  const HtmlWebpackPluginOption = userOption["@HtmlWebpackPluginOption"] || {};

  const { framework = "react", isPro } = ctx;
  const hashHolder = hash ? ".[contenthash:6]" : "";
  const sassRule = createScssRules();

  // 检测SCSS全局变量
  const sassVar = path.join(ctx.buildFolder, "style/var.scss");
  if (fs.existsSync(sassVar)) {
    print("use sass global variable");
    sassRule.use.push({
      loader: "sass-resources-loader",
      options: { resources: sassVar },
    });
  }

  return {
    mode: isPro ? "production" : "development",
    entry: "./main/index.js",
    target: "web",
    output: {
      filename: `${ctx.build}${hashHolder}.min.js`,
      path: ctx.buildFolder + "/dist",
      clean: true,
    },
    plugins: [
      compiler => {
        new MiniCssExtractPlugin({
          filename: `${ctx.build}${hashHolder}.min.css`,
        }).apply(compiler);
      },
      compiler => {
        const Option = require("html-webpack-plugin");
        new Option({
          template: path.join(ctx.buildFolder, "template.html"),
          publicPath: "auto",
          ...HtmlWebpackPluginOption,
        }).apply(compiler);
      },
      compiler => {
        const WebpackBar = require("webpackbar");
        new WebpackBar().apply(compiler);
      },
    ],
    devServer: {
      static: {
        directory: userOption.output?.path || ctx.buildFolder + "/dist",
      },
      allowedHosts: "all",
      host: "127.0.0.1",
      port: 8000,
      open: true,
    },
    optimization: shouldOpimization(ctx),
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    resolve: {
      extensions: [".js", ".jsx", ".vue"],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: [{ loader: "babel-loader", options: babelOptions[framework] }],
          exclude: /node_modules/,
        },
        {
          test: /ynw.+js$/,
          use: [{ loader: "babel-loader", options: babelOptions[framework] }],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
        sassRule,
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: themeVars,
                },
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpe?g|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
  };
};

function createScssRules() {
  return {
    test: /\.s[ca]ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
          modules: {
            localIdentName: "[name]-[local]-[hash:base64:5]",
          },
        },
      },
      "postcss-loader",
      {
        loader: "sass-loader",
        options: { implementation: require("sass") },
      },
    ],
  };
}

// 生产环境启用压缩
function shouldOpimization(ctx) {
  if (!ctx.isPro) return {};
  return {
    runtimeChunk: "single",
    splitChunks: { chunks: "all" },
    minimize: true,
    minimizer: [
      compiler => {
        const TerserPlugin = require("terser-webpack-plugin");
        new TerserPlugin({
          terserOptions: { format: { comments: false } },
          extractComments: false,
        }).apply(compiler);
      },
      compiler => {
        const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
        new CssMinimizerPlugin().apply(compiler);
      },
    ],
  };
}
