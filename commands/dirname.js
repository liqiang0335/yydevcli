const path = require("path");
module.exports = ctx => {
  const { print } = ctx;
  print(path.dirname(__dirname));
};
