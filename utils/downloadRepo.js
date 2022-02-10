const download = require("download-git-repo");
const ora = require("ora");

/**
 * @param {String} name - 仓库名称
 */
module.exports = function (name) {
  return new Promise(resolve => {
    const target = process.cwd();
    const spinner = ora("Loading...".yellow).start();
    download(`liqiang0335/${name}`, target, err => {
      spinner.stop();
      if (err) {
        throw new Error("下载时出错");
      }
      console.log("完成");
      resolve();
    });
  });
};
