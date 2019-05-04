const alphavantage = require("./src/sources/alphavantage");
const yahoo = require("./src/sources/yahoo");
const { makeArgv, makeTickers } = require("./src/cli");

const sources = {
  alphavantage,
  yahoo,
};

module.exports = {
  getSources() {
    return Object.keys(sources);
  },

  getSource(name) {
    return sources[name];
  },

  makeArgv,

  makeTickers,
};
