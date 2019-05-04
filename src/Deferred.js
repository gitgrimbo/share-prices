module.exports = function Deferred(name, shouldLog = false) {
  function log(...args) {
    if (shouldLog) {
      console.log(...["Deferred", name, ...args]);
    }
  }

  let resolve;
  let reject;
  const p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  p.isResolved = false;
  p.isRejected = false;
  p.name = name;
  log("Created Deferred", p.name, p.isResolved, p.isRejected);
  p._resolve = function(value) {
    log("resolve", "name", name, "p.name", p.name);
    p.isResolved = true;
    log("resolve", `Deferred[${p.name}] resolving with`, value, "isResolved", p.isResolved);
    resolve(value);
    return value;
  };
  p._reject = function(err) {
    log("reject", "name", name, "p.name", p.name);
    p.isRejected = true;
    log("reject", `Deferred[${p.name}] rejecting with`, err, "isRejected", p.isRejected);
    reject(err);
    throw err;
  };
  return p;
};
