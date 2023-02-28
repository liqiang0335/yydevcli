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
      console.log("create: ", uploadConfigPath);
      await fs.writeFile(
        uploadConfigPath,
        JSON.stringify({
          folder: { local: "", remote: "" },
          files: [{ local: "", remote: "" }],
          shell: { cwd: "/root", exec: "ls -l" },
        })
      );
    }

    return;
  }

  // 读取配置文件名称
  let connectKey = "defaults"; // default config
  if (ctx.ssh !== "true") {
    connectKey = ctx.ssh;
  }
  console.log("connect use: ", connectKey);

  const connectConfig = require(connectConfigPath)[connectKey];
  if (!connectConfig) {
    return console.log("请设置", connectKey, connectConfigPath);
  }

  console.log("connect host: ", connectConfig.host);

  try {
    await ssh.connect(connectConfig);
  } catch (err) {
    console.log("连接失败, 请检查配置文件: ", connectConfigPath);
    return;
  }

  if (!_fs.existsSync(uploadConfigPath)) {
    console.log("缺少配置文件", uploadConfigPath);
    console.log("使用 'yy ssh init' 命令初始化配置文件");
    return;
  }

  const uploadConfig = require(uploadConfigPath);
  const { files, folder, shell } = uploadConfig;

  if (folder.local && folder.remote) {
    await putDirectoryHandler(folder);
  }
  if (files.length > 0) {
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
  console.log("local folder", local);
  console.log("remote folder", remote);
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
  console.log("🔺 RUN".green, `cd ${_cwd}`.green);
  console.log("🔺 RUN".green, `${_command}`.green);
  await ssh.execCommand(_command, { cwd: _cwd }).then(function (result) {
    if (result.stdout) {
      console.log(result.stdout);
    }
    if (result.stderr) {
      console.log(result.stderr);
    }
  });
}
