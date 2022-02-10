const package = require("../package.json");
/**
 * ----------------------------------------
 * 版本号
 * ----------------------------------------
 */
module.exports = ctx => {
  const { print } = ctx;
  print(`version`, package.version);
};
