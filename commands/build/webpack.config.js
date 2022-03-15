const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelOptions = require("./babel.config");
const print = require("../../utils/print");
const nodeExternals = require("webpack-node-externals");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
/**
 * ----------------------------------------
 * WEBPACK CONFIG
 * ----------------------------------------
 */
module.exports = function (userOption, ctx) {
  const browsers = userOption["@browsers"] || ["chrome >= 60"];
  const hash = userOption["@hash"];
  const themeVars = userOption["@themeVars"] || {};
  const HtmlWebpackPluginOption = userOption["@HtmlWebpackPluginOption"] || {};
  const outputPath = userOption.output?.path || ctx.buildFolder + "/dist";

  const { framework = "react", isPro } = ctx;
  const hashHolder = hash ? ".[contenthash:6]" : "";
  const sassRule = createScssRules();
  const babelOps = babelOptions({ browsers })[framework];

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
      path: outputPath,
      clean: true,
    },
    plugins: getPlugins(ctx, { hashHolder, HtmlWebpackPluginOption }),
    node: ctx.isNode ? { __dirname: false, __filename: false } : {},
    externals: ctx.isNode ? [nodeExternals()] : [], // node环境排除所有node_modules依赖
    devServer: {
      static: {
        directory: outputPath,
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
          use: [{ loader: "babel-loader", options: babelOps }],
          exclude: /node_modules/,
        },
        {
          test: /ynw.+js$/,
          use: [{ loader: "babel-loader", options: babelOps }],
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
                lessOptions: { javascriptEnabled: true, modifyVars: themeVars },
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

// 提取CSS+去掉注释+分包
function shouldOpimization(ctx) {
  if (!ctx.isPro) return {};
  const op = {
    minimize: true,
    minimizer: [
      compiler => {
        const TerserPlugin = require("terser-webpack-plugin");
        new TerserPlugin({
          terserOptions: { format: { comments: false } },
          extractComments: false,
        }).apply(compiler);
      },
    ],
  };
  if (!ctx.isNode) {
    // op.runtimeChunk = "single";
    // op.splitChunks = { chunks: "all" };
    op.minimizer.push(compiler => {
      new CssMinimizerPlugin().apply(compiler);
    });
  }
  return op;
}

function getPlugins(ctx, { HtmlWebpackPluginOption, hashHolder }) {
  const plugins = [];

  plugins.push(compiler => {
    const WebpackBar = require("webpackbar");
    new WebpackBar().apply(compiler);
  });

  if (!ctx.isNode) {
    plugins.push(compiler => {
      const suffix = hashHolder ? "min" : "bundle";
      new MiniCssExtractPlugin({
        filename: `${ctx.build}${hashHolder}.${suffix}.css`,
      }).apply(compiler);
    });
    plugins.push(compiler => {
      const Option = require("html-webpack-plugin");
      const templatePath = HtmlWebpackPluginOption.template || "template.html";
      new Option({
        publicPath: "auto",
        ...HtmlWebpackPluginOption,
        template: path.join(ctx.buildFolder, templatePath),
      }).apply(compiler);
    });
  }

  return plugins;
}
