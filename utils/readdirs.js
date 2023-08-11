const fs = require("fs");
const path = require("path");
const md5 = require("md5");

const ignores = [".DS_Store", ".git", "node_modules", "dist", "build"];

module.exports = { readdir, readTree, addIgnore };

/***
 * 添加忽略文件
 * @param names {Array|String} 文件名
 */
function addIgnore(names) {
  if (Array.isArray(names)) {
    ignores.push(...names);
  } else {
    ignores.push(names);
  }
}

/***
 * 递归读取目录
 * @returns {String} root 目录
 * @returns {Array} 路径列表:文件
 */
function readdir(root = process.cwd(), all = []) {
  const files = fs.readdirSync(root);
  for (let fileName of files) {
    // 判断是否应该忽略文件
    if (ignores.includes(fileName)) {
      continue;
    }
    const fpath = path.join(root, fileName);
    const dirname = path.dirname(fpath);
    const extName = path.extname(fpath).replace(".", "");
    const id = md5(fpath);
    const pid = md5(dirname); // 父级id
    const stat = fs.statSync(fpath);
    const isDir = stat.isDirectory(); // 是否是目录

    if (isDir) {
      readdir(fpath, all);
    } else {
      const data = { filePath: fpath, fileName, id, pid, extName };
      all.push(data);
    }
  }

  return all;
}

/***
 * 递归读取目录, 包含目录本身
 * @returns {String} root 目录
 * @returns {Array} 路径列表:文件和目录
 */
function readTree(root = process.cwd(), all = []) {
  const files = fs.readdirSync(root);
  for (let fileName of files) {
    if (ignores.includes(fileName)) {
      console.log("ignore:", fileName);
      continue;
    }
    const fpath = path.join(root, fileName);
    const dirname = path.dirname(fpath);
    const extName = path.extname(fpath).replace(".", "");
    const id = md5(fpath);
    const pid = md5(dirname); // 父级id
    const stat = fs.statSync(fpath);
    const isDir = stat.isDirectory(); // 是否是目录

    const data = { path: fpath, fileName, id, pid, extName, isDir };
    all.push(data);

    if (isDir) {
      readTree(fpath, all);
    }
  }

  return all;
}
