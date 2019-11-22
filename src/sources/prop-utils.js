/**
 * Example usage:
 * 
 * `get(ob, "person.address[2].postCode")`
 * 
 * If any intermediate property is `undefined`, this function will throw an `Error`.
 * 
 * @param {object} ob The object to get a property from.
 * @param {string} prop The name of the prop to get.
 */
function get(ob, prop) {
  // console.log("get()", ob, prop);
  const parts = prop.split(".");
  let runningProp = "";
  for (const part of parts) {
    // console.log("part", part);
    let it;
    const arrayExec = /(.*)\[(\d+)\]$/.exec(part);
    // console.log(arrayExec);
    if (arrayExec) {
      const [ignore, name, index] = arrayExec;
      it = ob[name];
      runningProp += runningProp ? "." + name : name;
      if (typeof it === "undefined") {
        throw new Error(`"${runningProp}" not found`);
      }
      if (it === null) {
        throw new Error(`"${runningProp}" is null, so "${runningProp}[${index}]" cannot be accessed.`);
      }
      runningProp += `[${index}]`;
      it = it[index];
    } else {
      it = ob[part];
      runningProp += runningProp ? "." + part : part;
    }
    if (typeof it === "undefined") {
      throw new Error(`"${runningProp}" not found`);
    }
    ob = it;
    // console.log("runningProp", runningProp);
  }
  return ob;
}

function arrGetLastValidValue(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("arrGetLastValidValue must be passed an array");
  }
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];
    if (typeof val !== "undefined" && val !== null) {
      return val;
    }
  }
  return null;
}

module.exports = {
  get,
  arrGetLastValidValue,
};
