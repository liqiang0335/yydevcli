const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async ctx => {
  const cmd = `open -n '/Applications/Google Chrome.app/' --args --disable-web-security  --user-data-dir=/Users/liqiang/Documents/chromeDevData`;
  await exec(cmd);
};
