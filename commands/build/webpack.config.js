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
  const pack = require(process.cwd() + "/package.json");

  const browsers = userOption["@browsers"] || ["chrome >= 60"];
  const cssInline = userOption["@cssInline"];
  let hash = userOption["@hash"];
  const cssModules = userOption["@cssModules"];
  const antd = userOption["@antd"];
  const fileName = userOption["@fileName"] || ctx.build;
  const themeVars = userOption["@themeVars"] || {};
  const HtmlWebpackPluginOption = userOption["@HtmlWebpackPluginOption"] || {};
  const outputPath = userOption.output?.path || ctx.buildFolder + "/dist";
  const saveFolder = userOption["@saveFolder"] === undefined ? "bundle/" : userOption["@saveFolder"];
  const version = userOption["@version"] || pack.version;

  print("输出路径", outputPath);

  const { framework = "react", isPro } = ctx;
  const hashHolder = hash ? "[contenthash:6]" : `${version}.bundle`;
  const cssloader = cssInline ? "style-loader" : MiniCssExtractPlugin.loader;

  const share = {
    saveFolder,
    pack,
    HtmlWebpackPluginOption,
    hashHolder,
    cssloader,
    outputPath,
    fileName,
    cssModules,
    hash,
    cssInline,
    browsers,
  };

  const babelOps = babelOptions({ browsers, antd })[framework];
  const sassRule = createScssRules(share);

  // 检测SCSS全局变量
  const sassVar = path.join(ctx.buildFolder, "style/var.scss");
  if (fs.existsSync(sassVar)) {
    print("加载全局变量: style/var.scss");
    sassRule.use.push({
      loader: "sass-resources-loader",
      options: { resources: sassVar },
    });
  }

  const options = {
    mode: isPro ? "production" : "development",
    entry: "./main/index.js",
    target: "web",
    output: {
      filename: saveFolder + `${fileName}.${hashHolder}.js`,
      path: outputPath,
      clean: true,
      assetModuleFilename: "assets/[hash][ext]",
    },
    plugins: getPlugins(ctx, share), // 加载插件
    node: ctx.isNode ? { __dirname: false, __filename: false } : {},
    externals: ctx.isNode ? [nodeExternals()] : [], // node 环境排除所有 node_modules 依赖
    devServer: {
      static: { directory: outputPath },
      allowedHosts: "all",
      host: "127.0.0.1",
      port: 10000,
      open: true,
    },
    optimization: shouldOpimization(ctx),
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    stats: {
      warningsFilter: /HMR|webpack-dev-server/,
    },
    resolve: { extensions: [".js", ".jsx", ".vue"] },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: [{ loader: "babel-loader", options: babelOps }],
          exclude: /node_modules/,
        },
        { test: /ynw.+js$/, use: [{ loader: "babel-loader", options: babelOps }] },
        { test: /\.css$/, use: [cssloader, "css-loader", "postcss-loader"] },
        sassRule,
        {
          test: /\.less$/i,
          use: [cssloader, "css-loader", { loader: "less-loader", options: { lessOptions: { javascriptEnabled: true, modifyVars: themeVars } } }],
        },
        { test: /\.(png|svg|jpe?g|gif)$/i, type: "asset/resource" },
        { test: /\.(woff|woff2|eot|ttf|otf|docx?|xlsx?)$/i, type: "asset/resource" },
      ],
    },
  };

  return options;
};

/**
 * ----------------------------------------
 * SCSS配置
 * ----------------------------------------
 */
function createScssRules(share) {
  const { cssModules, cssloader } = share;
  let modules = { localIdentName: "[name]-[local]-[hash:base64:8]" };

  if (cssModules === false) {
    modules = false;
    print("cssModules disabled");
  }

  if (typeof cssModules === "string") {
    modules = { localIdentName: cssModules };
  }

  return {
    test: /\.s[ca]ss$/,
    use: [
      cssloader,
      { loader: "css-loader", options: { importLoaders: 2, modules } },
      "postcss-loader",
      { loader: "sass-loader", options: { implementation: require("sass") } },
    ],
  };
}

/**
 * ----------------------------------------
 * 提取CSS+去掉注释+分包
 * ----------------------------------------
 */
function shouldOpimization(ctx) {
  if (!ctx.isPro) return {};
  const op = {
    minimize: true,
    minimizer: [
      (compiler) => {
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
    op.minimizer.push((compiler) => {
      new CssMinimizerPlugin().apply(compiler);
    });
  }
  return op;
}

/**
 * ----------------------------------------
 * 插件配置
 * ----------------------------------------
 */
function getPlugins(ctx, share) {
  const { hashHolder, HtmlWebpackPluginOption, fileName, saveFolder } = share;
  const plugins = [];

  plugins.push((compiler) => {
    const WebpackBar = require("webpackbar");
    new WebpackBar().apply(compiler);
  });

  if (!ctx.isNode) {
    plugins.push((compiler) => {
      new MiniCssExtractPlugin({
        filename: saveFolder + `${fileName}.${hashHolder}.css`,
      }).apply(compiler);
    });

    plugins.push((compiler) => {
      const Option = require("html-webpack-plugin");
      const templatePath = HtmlWebpackPluginOption.template || "template.html";
      const ops = {
        ...HtmlWebpackPluginOption,
        publicPath: "auto",
        template: path.join(ctx.buildFolder, templatePath),
      };

      // 如果匹配到全局模版路径,则直接使用
      const isAbsolute = /^[/\\]/.test(templatePath);
      if (isAbsolute) {
        ops.template = HtmlWebpackPluginOption.template;
      }

      // 如果是开发模式: 如果存在开发模版, 则使用开发模版
      if (ctx.isHot) {
        const devTemplate = path.join(ctx.buildFolder, "template-dev.html");
        if (fs.existsSync(devTemplate)) {
          ops.template = devTemplate;
        }
      }

      // 如果是生产环境,则使用publicPath
      // 热更新模式,使用auto
      if (HtmlWebpackPluginOption.publicPath) {
        if (!ctx.isHot) {
          ops.publicPath = HtmlWebpackPluginOption.publicPath;
        }
      }

      new Option(ops).apply(compiler);
    });
  }

  return plugins;
}
