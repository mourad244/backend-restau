module.exports = getPathData = (files) => {
  let filtered = {};
  for (let item in files) {
    filtered[item] = files[item];
  }
  return filtered;
};
