const fs = require("fs");
const path = require("path");
const random = require("crypto-random-string");
/**
 * ----------------------------------------
 * yy rename [xxx]
 * yy rename [xxx] random
 * yy rename [xxx] pad=3
 * ----------------------------------------
 */
function main(ctx) {
  const cwd = process.cwd();
  const arg = process.argv;
  const prefix = arg[3];
  const files = fs.readdirSync(cwd).filter((it) => /(jpe?g|png|gif)$/i.test(it));

  files.forEach((item, i) => {
    const oldName = path.join(cwd, item);
    const ext = path.extname(oldName);
    let index = `${i + 1}`;

    if (ctx.pad) {
      index = index.padStart(+ctx.pad, "0");
    }

    if (ctx.random) {
      index = index + "_" + random({ length: 5 });
    }
    const newName = path.join(cwd, `${prefix}_${index}${ext}`);
    console.log("⭕️ newName: ", newName);
    fs.renameSync(oldName, newName);
  });
}

module.exports = (ctx) => {
  main(ctx);
};
