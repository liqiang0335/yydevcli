const fs = require("fs");
const path = require("path");
const recursive = require("recursive-readdir");
const { select, confirm } = require("@inquirer/prompts");
const sourcedir = path.join(__dirname, "../assets");
const dirFromSource = (name) => path.join(sourcedir, name);
const copyFile = require("../utils/copyFile");

module.exports = async (ctx) => {
  const { cwd, print } = ctx;

  const ok = await confirm({ message: "是否初始化项目: " + cwd, default: true });
  if (!ok) return;

  const answer = await select({
    message: "选择模版",
    choices: [
      { name: "React", value: "React" },
      { name: "Vue2", value: "Vue2" },
      { name: "Electron", value: "Electron" },
      { name: "Express", value: "Express" },
      { name: "Nest", value: "Nest" },
      { name: "SpringBoot", value: "SpringBoot" },
    ],
  });

  const sourceDir = dirFromSource(answer);
  const files = await recursive(sourceDir);

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
