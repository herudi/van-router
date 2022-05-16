import * as esbuild from "https://deno.land/x/esbuild@v0.14.25/mod.js";

const VERSION = "0.4.5";

const dir = Deno.cwd();
const dir_npm = dir + "/npm";
try {
  await Deno.remove(dir_npm, { recursive: true });
} catch (_e) { /* noop */ }

try {
  await Deno.mkdir(dir_npm, { recursive: true });
} catch (_e) { /* noop */ }

try {
  const myCode = await esbuild.build({
    loader: {
      ".ts": "ts",
    },
    target: ["es6"],
    logLevel: "silent",
    format: "esm",
    platform: "browser",
    bundle: true,
    entryPoints: ["./index.ts"],
    write: false,
  });
  const shim =
    `if (typeof window !== "undefined") {window.module = window.module || {};if (typeof window.module.exports !== "object") {window.module.exports = {};}};`;
  const code = myCode.outputFiles[0].text;
  await Deno.writeTextFile(dir_npm + "/index.esm.js", code);
  const cjs = code.replace("export {", "module.exports = {");
  await Deno.writeTextFile(dir_npm + "/index.js", shim + "\n" + cjs);
  const min_code = await esbuild.transform(cjs, {
    minify: true,
  });
  await Deno.writeTextFile(
    dir_npm + "/index.min.js",
    `var VanRouter=(()=>{${
      min_code.code.replace(shim, "").replace(/VanRouter/g, "my__")
    }return my__})();`.replace("\n", "").replace("module.exports={my__};", ""),
  );
  await Deno.writeTextFile(
    dir_npm + "/package.json",
    `{
  "name": "van-router",
  "description": "A small router middleware for vanillajs.",
  "version": "${VERSION}",
  "main": "index.js",
  "browser": "index.min.js",
  "unpkg": "index.min.js",
  "module": "index.esm.js",
  "types": "index.d.ts",
  "author": "Herudi",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/herudi/van-router"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "keywords": [
    "Router for vanillajs",
    "2kb router vanillajs"
  ],
  "dependencies": {},
  "devDependencies": {}
}`,
  );
  await Deno.copyFile("LICENSE", dir_npm + "/LICENSE");
  await Deno.copyFile("README.md", dir_npm + "/README.md");
  console.log("Success build...");
  esbuild.stop();
} catch (err) {
  console.log(err.message);
  esbuild.stop();
}
