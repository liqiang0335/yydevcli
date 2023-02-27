const fs = require("fs/promises");
const _fs = require("fs");
const path = require("path");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
/**
 * ----------------------------------------
 * SSH 上传文件
 * ========================================
 * yy ssh
 * yy ssh init
 * ----------------------------------------
 */
module.exports = async ctx => {
  const cwd = process.cwd();
  const connectConfigPath = path.join(USER_HOME, `yyssh.connect.json`);
  const uploadConfigPath = path.join(cwd, `yyssh.upload.json`);

  if (ctx.init) {
    if (!_fs.existsSync(connectConfigPath)) {
      await fs.writeFile(
        connectConfigPath,
        JSON.stringify({
          defaults: { host: "", username: "", password: "", privateKeyPath: "" },
        })
      );
    }
    if (!_fs.existsSync(uploadConfigPath)) {
      await fs.writeFile(uploadConfigPath, JSON.stringify({ local: "本地文件夹", remote: "远程文件夹" }));
    }
    return;
  }

  // 读取配置文件名称
  let connectKey = ""; // 默认配置
  if (ctx.ssh === "true") {
    connectKey = "defaults";
  }
  console.log("⭕️ 读取配置: ", connectKey);
  const connectConfig = require(connectConfigPath)[connectKey];
  console.log("⭕️ 连接服务器: ", connectConfig.host);

  try {
    await ssh.connect(connectConfig);
  } catch (err) {
    console.log("⭕️", "连接失败, 请检查配置文件: ", connectConfigPath);
    return;
  }

  try {
    const uploadConfig = require(uploadConfigPath);
  } catch (err) {
    throw new Error(err);
  }

  // uploadDirs(localConfig.local, localConfig.remote);
};

async function uploadDirs(dirLocal, dirRemote) {
  const failed = [];
  const successful = [];

  // 不是所有服务器都支持并发
  return ssh
    .putDirectory(dirLocal, dirRemote, {
      recursive: true,
      concurrency: 10,
      validate: function (itemPath) {
        const baseName = path.basename(itemPath);
        return (
          baseName.substring(0, 1) !== "." && // 不上传文件夹下的隐藏文件
          baseName !== "node_modules" // 不上传文件夹 node_modules
        );
      },
      tick: function (uploadConfigPath, remotePath, error) {
        if (error) {
          failed.push(uploadConfigPath);
        } else {
          successful.push(uploadConfigPath);
        }
      },
    })
    .then(function (status) {
      console.log("状态", status ? "成功" : "失败");
      if (failed.length > 0) {
        console.log("上传失败:");
        for (let fail_item of failed) {
          console.log("-- " + fail_item + "\n");
        }
      }
      if (successful.length > 0) {
        console.log("上传成功:");
        for (let suc_item of successful) {
          console.log("-- " + suc_item + "\n");
        }
      }
    });
}
