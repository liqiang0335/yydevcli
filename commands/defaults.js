const fs = require("fs");
const path = require("path");
const package = require("../package.json");

module.exports = ctx => {
  const { print } = ctx;
  print("v" + package.version + ` 命令列表`);
  const files = fs.readdirSync(path.join(__dirname)).filter(it => /^\w/.test(it));
  for (let name of files) {
    print("yy " + name.match(/\w+/)[0]);
  }
};
