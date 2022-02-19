module.exports = ctx => main(ctx);
const path = require("path");
const fs = require("fs");
const cwd = process.cwd();
let _current = cwd;

/**
 * create file base on json file
 * ynw createfile source="summary.json"
 */
function main(ctx) {
  const { source } = ctx;
  let filePath = path.join(cwd, source);
  if (fs.existsSync(filePath)) {
    const json = require(filePath);
    create(json);
  } else {
    console.log(`Source file not Found`);
  }
}

function create(json) {
  for (let key in json) {
    const value = json[key];
    const isFile = typeof value === "string";

    if (isFile) {
      const fileName = `${key}.${value}`;
      const file = path.join(_current, fileName);
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, `# ${fileName}`, "utf8");
      }
    } else {
      const folder = path.join(_current, key);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      changeCurrent(key);
      create(value);
    }
  }
  changeCurrent();
}

function changeCurrent(key) {
  if (key) {
    // Up One Level
    _current = path.join(_current, key);
  } else {
    // Down One Level
    _current = _current.replace(/\\+/g, "\\\\"); // \ => \\
    _current = _current.replace(/[\\\/]+[^\\\/]+$/, "");
  }
}
