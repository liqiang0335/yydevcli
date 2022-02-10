const fs = require("fs");
const path = require("path");
const log = require("./log");

/**
 * ----------------------------------------
 * 加载项目文件,基于项目根目录
 * ----------------------------------------
 */
const loadProFile = filePath => {
  const cwd = process.cwd();
  const target = path.join(cwd, filePath);
  if (fs.existsSync(target)) {
    return require(target);
  } else {
    log(`${filePath} 文件不存在`);
    return;
  }
};

module.exports = loadProFile;
