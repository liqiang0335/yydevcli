const fs = require("fs");
const path = require("path");

module.exports = ctx => {
  const { cwd, print } = ctx;
  const sourceFolder = path.join(__dirname, "../assets/init/");
  const files = fs.readdirSync(sourceFolder, "utf8");
  files.forEach(fileName => {
    const filePath = path.join(sourceFolder, fileName);
    const target = path.join(cwd, fileName);
    if (fs.existsSync(target)) {
      print(`${fileName} exists:`, "ignore".blue);
    } else {
      print("write".blue, fileName);
      fs.createReadStream(filePath).pipe(fs.createWriteStream(target));
    }
  });
};
