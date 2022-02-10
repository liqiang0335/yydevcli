function log() {
  if (process.argv.includes("debug")) {
    const params = [`[YY]`].concat(Array.from(arguments));
    console.log.apply(null, params);
  }
}

module.exports = log;
