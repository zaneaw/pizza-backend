const cors = require("cors");

const whitelist = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3000",
    "https://localhost:3001",
    "http://localhost:3443",
    "https://localhost:3443",
    "http://zanepc:3001",
    "https://zanepc:3001",
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  // indexOf returns -1 if not found
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    // origin of request found in whitelist, move forward
    corsOptions = { origin: true };
  } else {
    // origin of request not found, move forward with error
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};
// allow all CORS
exports.cors = cors();
// CORS restricted
exports.corsWithOptions = cors(corsOptionsDelegate);
