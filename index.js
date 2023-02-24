// make sure globals are installed before we do anything else
// that way everything's referencing the same globals
require("@remix-run/node/dist/globals").installGlobals();

require("dotenv/config");

if (process.env.NODE_ENV === "production") {
  require("./server-build");
} else {
  require("./server");
}
