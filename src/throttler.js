const Deferred = require("./Deferred");

module.exports = function throttler(requestsPerPeriod, period, shouldLog = false) {
  function log(...args) {
    if (shouldLog) {
      console.log(...["throttler", ...args]);
    }
  }

  let inflight = [];
  let supplierQueue = [];
  let startTimes = [];
  let state = null;

  const removeInflight = (promiseToRemove) => inflight = inflight.filter((p) => p !== promiseToRemove);

  function inflightWindow() {
    return startTimes.reduce((result, start) => {
      let [first, last] = result;
      if (!first) {
        first = start;
      }
      if (!last) {
        last = start;
      }
      if (start < first) {
        first = start;
      }
      if (start > last) {
        last = start;
      }
      return [first, last];
    }, []);
  }

  function addStartTime(start) {
    startTimes = (startTimes.length < requestsPerPeriod)
      ? [...startTimes, start]
      : [...startTimes.slice(1), start];
  }

  function processQueue() {
    if (supplierQueue.length === 0) {
      state = "supplierQueue empty";
      log("processQueue", "supplierQueue empty");
      return;
    }

    if (inflight.length >= requestsPerPeriod) {
      state = "inflight maxed";
      log("processQueue", "inflight maxed", inflight.length, requestsPerPeriod);
      return;
    }

    const now = Date.now();

    let window;

    const shouldProcess = () => {
      if (startTimes.length < requestsPerPeriod) {
        // We haven't made enough requests yet to hit the requests limit
        log("startTimes.length", startTimes.length, "supplierQueue.length", supplierQueue.length, "inflight.length", inflight.length);
        return true;
      }

      // We have a full set of start times, this means we have made enough requests for the period to matter.
      const [first, last] = inflightWindow();
      window = now - first;
      log("first", first, "last", last, "now", now, "window", window, "period", period, "supplierQueue.length", supplierQueue.length, "inflight.length", inflight.length);

      // Is the gap between the first and last times we made a request larger than the allowed period?
      // If so, we can process another request.
      return (window > period);
    };

    if (shouldProcess()) {
      state = "processing";
      log("shouldProcess", "now", now, "supplierQueue.length", supplierQueue.length, "inflight.length", inflight.length);
      const [[promiseSupplier, d], ...rest] = supplierQueue;
      supplierQueue = rest;
      log(`Pulled Deferred: ${d.name} out of the queue`);
      addStartTime(now);
      const p = promiseSupplier()
        .then((value) => {
          log("promiseSupplier.then", value, "Resolving", d.name);
          removeInflight(p);
          setTimeout(processQueue);
          d._resolve(value);
          return value;
        })
        .catch((err) => {
          log("promiseSupplier.catch", err, "Rejecting", d.name);
          removeInflight(p);
          setTimeout(processQueue);
          d._reject(err);
          throw err;
        });
      inflight.push(p);
      return;
    }

    const waitFor = period - window;
    log(`budget spent. waiting for ${waitFor} ms`);
    state = "waiting";
    setTimeout(processQueue, waitFor);
  }

  function add(promiseSupplier, name) {
    log(`Adding to throttler, Deferred called ${name}`);
    const d = new Deferred(name);
    log(`Deferred: ${d.name}`);
    supplierQueue.push([promiseSupplier, d]);
    setTimeout(processQueue);
    return d;
  }

  function getState() {
    return state;
  }

  return {
    add,
    getState,
  };
};
