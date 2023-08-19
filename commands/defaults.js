const fs = require("fs");
const path = require("path");
const package = require("../package.json");

module.exports = (ctx) => {
  const { print } = ctx;
  print("v" + package.version + ` 命令列表`);
};
