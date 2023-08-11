const fs = require("fs");
const path = require("path");
const { readdir } = require("../utils/readdirs");
const { select, confirm } = require("@inquirer/prompts");
const sourcedir = "/Users/liqiang/Documents/repos/liqiang/templates";
const copyFile = require("../utils/copyFile");

const dirFromSource = (name) => path.join(sourcedir, name);

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

  const sourceDir = dirFromSource(answer);
  const files = readdir(sourceDir);

  files.forEach((sourceFilePath) => {
    const basename = path.basename(sourceFilePath);
    const relative = path.relative(sourceDir, sourceFilePath);
    const targetFilePath = path.join(cwd, relative);

    if (fs.existsSync(targetFilePath)) {
      print("[ignore]".yellow, `${basename}`);
    } else {
      print("[add]".green, basename);
      copyFile(sourceFilePath, targetFilePath);
    }
  });
};
