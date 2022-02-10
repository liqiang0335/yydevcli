function mergeOnSource(source, target) {
  if (!target) return source;
  for (let key in source) {
    if (target[key] !== undefined) {
      source[key] = target[key];
    }
  }
  return source;
}

module.exports = mergeOnSource;
