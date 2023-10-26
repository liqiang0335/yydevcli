const fs = require("fs");
const path = require("path");
const { readdir } = require("../utils/readdirs");
const { select, confirm } = require("@inquirer/prompts");
const copyFile = require("../utils/copyFile");

const SOURCEDIR = "/Users/liqiang/Documents/repos/liqiang/templates";
const dirFromSource = (name) => path.join(SOURCEDIR, name);
const configPath = path.join(SOURCEDIR, "_config.js");

module.exports = async (ctx) => {
  const { cwd, print } = ctx;
  const isForce = ctx["-f"];

  const ok = await confirm({ message: "是否初始化到: " + path.basename(cwd), default: true });
  if (!ok) return;

  // 加载JS模版配置
  const choices = require(configPath);

  const answer = await select({
    message: "选择模版",
    choices: choices,
  });

  const SOURCE_DIR = dirFromSource(answer);
  const items = readdir(SOURCE_DIR);

  items.forEach((item) => {
    let { fileName, filePath } = item;
    const basename = path.basename(cwd);
    const relative = path.relative(SOURCE_DIR, filePath);

    // 替换文件名
    const targetFilePath = path
      .join(cwd, relative) // 目标文件路径
      .replace(/\[dirname\]/, basename); //  [dirname] => 文夹名

    if (fs.existsSync(targetFilePath)) {
      if (isForce) {
        fs.writeFileSync(targetFilePath, fs.readFileSync(filePath));
      } else {
        print("[ignore]".yellow, `${fileName}`);
      }
    } else {
      print("[add]".green, fileName);
      copyFile(filePath, targetFilePath);
    }
  });
};
