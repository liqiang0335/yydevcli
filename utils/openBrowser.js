const { exec } = require("child_process");

module.exports = function openBrowser(url) {
  return new Promise((resove, reject) => {
    const handler = {
      darwin: `open -a "Google Chrome" ${url}`,
      win32: `start chrome ${url}`,
    };
    const platform = process.platform;
    const cmd = handler[platform];

    exec(cmd, err => {
      if (err) {
        console.log(err);
        reject();
      } else {
        resove();
      }
    });
  });
};
