function print() {
  const params = [`[YY]`].concat(Array.from(arguments));
  console.log.apply(null, params);
}

module.exports = print;
