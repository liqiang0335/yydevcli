const fs = require("fs");
const path = require("path");

/***
 * 复制文件
 * 如果目标文件夹不存在, 则创建
 */
function copyFile(source, target) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(source, target);
}

module.exports = copyFile;
