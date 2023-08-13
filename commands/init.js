const fs = require("fs");
const path = require("path");
const { readdir } = require("../utils/readdirs");
const { select, confirm } = require("@inquirer/prompts");
const copyFile = require("../utils/copyFile");

const SOURCEDIR = "/Users/liqiang/Documents/repos/liqiang/templates";
const dirFromSource = (name) => path.join(SOURCEDIR, name);

module.exports = async (ctx) => {
  const { cwd, print } = ctx;

  const ok = await confirm({ message: "是否初始化到: " + path.basename(cwd), default: true });
  if (!ok) return;

  const answer = await select({
    message: "选择模版",
    choices: [
      { name: "table-base", value: "template-table-base", description: "基础列表" },
      { name: "react-base", value: "template-react-base", description: "基础配置" },
      { name: "manage-react", value: "template-manage-react", description: "后台管理" },
      { name: "manage-react-fixed", value: "template-manage-fixed", description: "固定菜单栏" },
      { name: "mobile-vue2", value: "template-mobile-vue2", description: "移动端Web" },
      { name: "electron", value: "template-electron", description: "桌面客户端" },
      { name: "taro-mini", value: "template-taro-mini", description: "使用Taro开发微信小程序" },
      { name: "express-base", value: "template-express-base", description: "HTTP服务-基本配置" },
      { name: "nest", value: "template-nest", description: "HTTP服务端" },
    ],
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
      .replace(/\[dirname\]/, basename); //  [dirname] => 文件夹名

    if (fs.existsSync(targetFilePath)) {
      print("[ignore]".yellow, `${fileName}`);
    } else {
      print("[add]".green, fileName);
      copyFile(filePath, targetFilePath);
    }
  });
};
