// Basic CLI arg parsing - args array to arg map.
function makeArgv(args) {
  return args.reduce((argv, arg, i) => {
    if (arg.startsWith("--")) {
      arg = arg.substring(2);
      const idxEquals = arg.indexOf("=");
      if (idxEquals < 0) {
        argv[arg] = true;
      } else {
        argv[arg.substring(0, idxEquals)] = arg.substring(idxEquals + 1);
      }
    }
    return argv;
  }, {});
}

// Convert a comma separated string of tickers to an array.
function makeTickers(arg) {
  return arg
    ? arg.split(",").map((s) => s.trim())
    : null;
}

module.exports = {
  makeArgv,
  makeTickers,
};
