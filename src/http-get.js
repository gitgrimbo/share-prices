const https = require("https");

function get(uri) {
  return new Promise((resolve, reject) => {
    const req = https.get(uri, (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        // console.log("data", chunk);
        data += chunk;
      });
      resp.on("end", () => {
        // console.log("end");
        resolve(data);
      });
    });
    req.on("error", reject);
  });
}

module.exports = get;
