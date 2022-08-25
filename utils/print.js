function print() {
  const params = [`⭕️`].concat(Array.from(arguments));
  console.log.apply(null, params);
}

module.exports = print;
