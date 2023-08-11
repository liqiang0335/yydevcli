const fs = require("fs");
const path = require("path");
const { readdir } = require("../utils/readdirs");
const { select, confirm } = require("@inquirer/prompts");
const copyFile = require("../utils/copyFile");

const SOURCEDIR = "/Users/liqiang/Documents/repos/liqiang/templates";
const dirFromSource = (name) => path.join(SOURCEDIR, name);

module.exports = async (ctx) => {
  const { cwd, print } = ctx;
  const ok = await confirm({ message: "是否初始化到: " + cwd, default: true });
  if (!ok) return;

  const answer = await select({
    message: "选择模版",
    choices: [
      { name: "React", value: "React" },
      { name: "Vue2", value: "Vue2" },
      { name: "Electron", value: "Electron" },
      { name: "Express", value: "Express" },
      { name: "Nest", value: "Nest" },
    ],
  });

  const SOURCE_DIR = dirFromSource(answer);
  const items = readdir(SOURCE_DIR);

  items.forEach((item) => {
    const { fileName, filePath } = item;
    const relative = path.relative(SOURCE_DIR, filePath);
    const targetFilePath = path.join(cwd, relative);

    if (fs.existsSync(targetFilePath)) {
      print("[ignore]".yellow, `${fileName}`);
    } else {
      print("[add]".green, fileName);
      copyFile(filePath, targetFilePath);
    }
  });
};
