const path = require("path");
const os = require("os");
const isWin = os.platform() == "win32";
const _join = path.join;

path.join = (...arg) => {
  const url = _join.call(this, ...arg);
  if (isWin) {
    return url.replace(/\\+/g, `\\`);
  } else {
    return url.replace(/\\+/g, "/");
  }
};
