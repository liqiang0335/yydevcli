#!/usr/bin/env node

console.log("-----------------------------");
const fs = require("fs");
const path = require("path");
console.log(process.cwd());

const dotenv = require("dotenv");
dotenv.config({ path: [".env.local", ".env"] });

require("./utils/enhanceJoin");
require("colors");
const loadFile = require("./utils/loadFile");
const log = require("./utils/log");
const print = require("./utils/print");
const cwd = process.cwd();

main();
console.log("-----------------------------");

function main() {
  const commandsFolder = path.join(__dirname, "./commands");
  const commands = getCommands(fs.readdirSync(commandsFolder));
  const exec = getInputCommand();
  log("执行命令", exec);

  if (commands.includes(exec)) {
    const argv = getParams(process.argv);
    const share = {
      cwd, // 当前工作区
      loadFile, // 获取工作区文件路径
      log, // 打印
      print // 打印
    };
    const ctx = Object.assign(share, argv);
    require(`./commands/${exec}`)(ctx);
  } else {
    log("无效命令", exec);
  }
}

function getInputCommand() {
  const input = process.argv[2];
  if (input) {
    return input.match(/\w+/)[0];
  }
  return "defaults";
}

function getCommands(folder) {
  return folder.filter((it) => !it.startsWith(".")).map((it) => it.replace(/\.[a-z]+$/, ""));
}

// 获取命令行参数
function getParams(arr) {
  const reg = /=|--/i;

  const result = arr
    .filter((_, i) => i > 1)
    .reduce((acc, cur) => {
      if (!reg.test(cur)) {
        cur = `${cur}=true`;
      }

      cur = cur.replace(/--([^\s]+)/, "$1=true");

      const [key, value] = cur.split("=");

      const v = value === "true" ? true : value;

      // 如果是路径, 则放入paths数组
      if (/\//.test(key)) {
        acc.paths = acc.paths || [];
        acc.paths.push(key);
      } else {
        acc[key] = v;
      }

      return acc;
    }, {});

  return result;
}
