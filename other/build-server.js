import { build } from "esbuild";
import { ensureDir, copySync } from "fs-extra";
import { join, parse } from "path";
import { sync } from "glob";
import { engines } from "../package.json";

const here = (...s) => join(__dirname, ...s);

const allFiles = sync(here("../server/**/*.*"), {
  ignore: ["**/tsconfig.json", "**/eslint*", "**/__tests__/**"],
});

const entries = [];
for (const file of allFiles) {
  if (/\.(ts|js|tsx|jsx)$/.test(file)) {
    entries.push(file);
  } else {
    const dest = file.replace(here("../server"), here("../server-build"));
    ensureDir(parse(dest).dir);
    copySync(file, dest);
    console.log(`copied: ${file.replace(`${here("../server")}/`, "")}`);
  }
}

console.log();
console.log("building...");

build({
  entryPoints: sync(here("../server/**/*.+(ts|js|tsx|jsx)")),
  outdir: here("../server-build"),
  target: [`node${engines.node}`],
  platform: "node",
  format: "cjs",
  logLevel: "info",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
