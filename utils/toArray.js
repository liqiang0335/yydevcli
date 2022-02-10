function toArray(source) {
  if (Array.isArray(source)) {
    return source;
  }
  if (!source) {
    return [];
  }
  return [source];
}

module.exports = toArray;
