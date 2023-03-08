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
 * yy upload
 * ----------------------------------------
 */
module.exports = async ctx => {
  const cwd = process.cwd();
  const serveFilePath = path.join(USER_HOME, "yy.serve.json");
  const upFilePath = path.join(cwd, "yy.upload.js");

  if (ctx.init) {
    if (!_fs.existsSync(serveFilePath)) {
      await fs.writeFile(
        serveFilePath,
        JSON.stringify({
          defaults: { host: "", username: "", password: "", privateKeyPath: "", port: 22 },
        })
      );
    }

    if (!_fs.existsSync(upFilePath)) {
      console.log("create: ", upFilePath);
      await fs.writeFile(
        upFilePath,
        "module.exports =" +
          JSON.stringify({
            serve: "defaults",
            folder: { local: "", remote: "" },
            files: [{ local: "", remote: "" }],
            shell: { cwd: "/root", exec: "ls -l" },
          })
      );
    }

    return;
  }

  if (!_fs.existsSync(upFilePath)) {
    console.log("缺少配置文件", upFilePath);
    console.log("使用 'yy upload init' 命令初始化配置文件");
    return;
  }

  const upOption = require(upFilePath);
  const { files, folder, shell, serve } = upOption;

  // 读取配置文件名称
  let serveKey = serve || "defaults";
  console.log("使用服务器配置", serveKey);

  const serveOption = require(serveFilePath)[serveKey];
  if (!serveOption) {
    return console.log("读取服务器配置失败", serveFilePath);
  }

  console.log("正在连接", `${serveOption.username}@${serveOption.host}:${serveOption.port || 22}`);

  try {
    await ssh.connect(serveOption);
    console.log("连接成功");
    if (ctx.test) {
      process.exit();
    }
  } catch (err) {
    console.log("连接失败,请检查配置文件", serveFilePath);
    return;
  }

  if (folder?.local && folder.remote) {
    await putDirectoryHandler(folder);
  }
  if (Array.isArray(files) && files.length > 0) {
    await putFilesHandler(files);
  }
  if (shell?.exec) {
    await runCommand(shell);
  }

  process.exit();
};

/**
 * ----------------------------------------
 * upload folder
 * ----------------------------------------
 */
async function putDirectoryHandler({ local, remote }) {
  console.log("本地文件夹", local);
  console.log("远程文件夹", remote);
  console.log("--------");
  const failed = [];
  const successful = [];

  // 不是所有服务器都支持并发
  await ssh
    .putDirectory(local, remote, {
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
        console.log("upload...", fileName);
        if (error) {
          console.log("❌ Error", fileName);
          failed.push(fileName);
        } else {
          successful.push(fileName);
        }
      },
    })
    .then(function (status) {
      console.log("--------");
      if (failed.length > 0) {
        console.log("❌ 上传失败:".red, failed.length);
      }
      if (successful.length > 0) {
        console.log("✅ 上传成功:".green, successful.length);
      }
    });
}

function putFilesHandler(files) {
  files = files.filter(it => it.local && it.remote);
  if (files.length === 0) return;

  return ssh.putFiles(files).then(
    function () {
      console.log("✅ 上传成功");
    },
    function (error) {
      console.log("❌ 上传失败");
      console.log(error);
    }
  );
}

async function runCommand(shell) {
  const _cwd = shell.cwd;
  const _command = shell.exec;
  console.log("🔺 执行命令".green, `cd ${_cwd}`.green);
  console.log("🔺 执行命令".green, `${_command}`.green);
  await ssh.execCommand(_command, { cwd: _cwd }).then(function (result) {
    if (result.stdout) {
      console.log(result.stdout);
    }
    if (result.stderr) {
      console.log(result.stderr);
    }
  });
}
