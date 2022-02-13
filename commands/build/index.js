const path = require("path");
const fs = require("fs");
const deepmerge = require("deepmerge");
const package = require("../../package");
const print = require("../../utils/print");
const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackDefaultOption = require("./webpack.config");
const _ = require("lodash");

module.exports = ctx => {
  print(`yy-cli version: ${package.version}`);
  const { cwd, loadFile, env = "hot" } = ctx;
  const yyconfig = loadFile("yy.config.js") || {};
  const userOption = getWebpackUserOption(yyconfig, ctx);

  ctx.buildFileName = path.basename(userOption.entry);
  ctx.buildFilePath = path.join(cwd, userOption.entry);
  ctx.buildFolder = path.dirname(ctx.buildFilePath);
  ctx.framework = checkframework(ctx.buildFilePath);
  ctx.isHot = env === "hot";
  ctx.isDev = env === "dev";
  ctx.isPro = env === "pro";

  print("babel-loader.options: ", `${ctx.framework}`.blue);

  const defaultOption = webpackDefaultOption(userOption, ctx);
  const option = deepmerge(defaultOption, userOption);

  if (ctx.logs) {
    print("ctx", ctx);
    print("option", option);
    print("rules", option.module.rules);
  }

  // 删除自定义属性
  for (let userKey in option) {
    if (/^@/.test(userKey)) {
      delete option[userKey];
    }
  }

  const compiler = webpack(option);

  const envHandler = {
    dev() {
      compiler.watch({ aggregateTimeout: 300, poll: undefined }, errorHandler);
    },
    pro() {
      compiler.run();
    },
    async hot() {
      const server = new WebpackDevServer(option.devServer, compiler);
      await server.start();
    },
  };

  if (envHandler[ctx.env]) {
    envHandler[ctx.env]();
  }
};

/**
 * ----------------------------------------
 * helpers
 * ----------------------------------------
 */

function checkframework(buildFilePath) {
  const filePath = buildFilePath + ".js";
  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(`没有找到入口文件: ${buildFilePath}`);
  }
  if (/import\s+vue/i.test(content)) {
    return "vue";
  }
  if (/import\s+react/i.test(content)) {
    return "react";
  }
  return "common";
}

function errorHandler(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
  }
  if (stats) {
    const buildInfo = stats.toString({
      chunks: false,
      colors: true,
      assets: true,
      chunkModules: false,
      chunks: false,
      children: false,
      maxModules: 1,
    });
    console.log(buildInfo);
  }
}

function getWebpackUserOption(yyconfig, ctx) {
  if (!yyconfig) {
    print(`"yy.config.js" Not Found => "yy init" `);
    return {};
  }

  // 合并 common-pages 配置
  const { common: commonOption, pages } = yyconfig;
  const pageOption = pages[ctx.build] || {};

  const option = deepmerge.all([
    commonOption,
    pageOption,
    { entry: ctx.entry },
  ]);

  const buildFilePath = path.join(ctx.cwd, option.entry);
  const buildFolder = path.dirname(buildFilePath);

  if (!option.entry) {
    throw new Error(`请配置 'entry' 参数`);
  }

  // 创建模版文件
  const templateFilePath = path.join(buildFolder, "template.html");
  if (!fs.existsSync(templateFilePath)) {
    const source = fs.readFileSync(
      path.join(__dirname, "../../assets/template.html")
    );
    fs.writeFileSync(templateFilePath, source);
    print("添加模版:template.html");
  }

  // 别名添加绝对路径
  if (option?.resolve?.alias) {
    for (let key in option.resolve.alias) {
      const value = option.resolve.alias[key];
      option.resolve.alias[key] = path.join(ctx.cwd, value);
    }
  }

  // 添加 @ 别名
  _.set(option, "resolve.alias.@", buildFolder);
  _.set(option, "resolve.alias.vue$", "vue/dist/vue.esm");

  return option;
}
