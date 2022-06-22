const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const arg = process.argv;
const random = require("crypto-random-string");
/**
 * ----------------------------------------
 * 重命名
 * yy rename myname
 * ----------------------------------------
 */
function main() {
  const prefix = arg[arg.length - 1];
  const files = fs.readdirSync(cwd).filter(it => /(jpe?g|png|gif)$/i.test(it));
  files.forEach((item, i) => {
    const oldName = path.join(cwd, item);
    const ext = path.extname(oldName);
    const index = `${i + 1}`.padStart(3, "0") + "_" + random({ length: 5 });
    const newName = path.join(cwd, `${prefix}_${index}${ext}`);
    fs.renameSync(oldName, newName);
  });
}

module.exports = ctx => {
  main(ctx);
};
