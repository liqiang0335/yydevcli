const fs = require("fs/promises");
const _fs = require("fs");
const path = require("path");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
/**
 * ----------------------------------------
 * 上传文件
 * ========================================
 * yy ssh
 * yy ssh init
 * yy ssh=[keyName]
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
      console.log("创建上传配置文件", uploadConfigPath);
      await fs.writeFile(
        uploadConfigPath,
        JSON.stringify({
          putDirectory: { local: "本地文件夹", remote: "远程文件夹" },
        })
      );
    }
    return;
  }

  // 读取配置文件名称
  let connectKey = "defaults"; // 默认配置
  if (ctx.ssh !== "true") {
    connectKey = ctx.ssh;
  }
  console.log("读取配置: ", connectKey);

  const connectConfig = require(connectConfigPath)[connectKey];
  if (!connectConfig) {
    return console.log("请先配置连接信息", connectConfigPath);
  }
  console.log("连接服务器: ", connectConfig.host);

  try {
    await ssh.connect(connectConfig);
  } catch (err) {
    console.log("连接失败, 请检查配置文件: ", connectConfigPath);
    return;
  }

  const uploadConfig = require(uploadConfigPath);
  if (!uploadConfig.putDirectory) {
    return console.log("请先配置上传文件夹信息");
  }

  const { putDirectory } = uploadConfig;
  await putDirectoryHandler(putDirectory.local, putDirectory.remote);

  process.exit();
};

async function putDirectoryHandler(dirLocal, dirRemote) {
  console.log("本地目录", dirLocal);
  console.log("远程目录", dirRemote);
  console.log("--------");
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
      tick: function (file, remotePath, error) {
        const fileName = path.basename(file);
        console.log("正在上传...", fileName);
        if (error) {
          console.log("❌ 出现错误", fileName);
          failed.push(fileName);
        } else {
          successful.push(fileName);
        }
      },
    })
    .then(function (status) {
      console.log("--------");
      if (failed.length > 0) {
        console.log("❌ 上传失败:", failed.length);
      }
      if (successful.length > 0) {
        console.log("✅ 上传成功:", successful.length);
      }
    });
}
