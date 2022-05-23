import * as esbuild from "https://deno.land/x/esbuild@v0.14.25/mod.js";

const VERSION = "0.6.3";

const dir = Deno.cwd();
const dir_npm = dir + "/npm";

try {
  await Deno.copyFile(dir_npm + "/index.js", dir_npm + "/index.node.js");
  // esm
  await esbuild.build({
    loader: {
      ".ts": "ts",
    },
    target: ["es6"],
    logLevel: "silent",
    format: "esm",
    platform: "browser",
    bundle: true,
    entryPoints: ["./index.ts"],
    outfile: dir_npm + "/index.esm.js",
  });
  const index = await Deno.readTextFile(dir_npm + "/index.node.js");
  const out = `"use strict"; 
  var Van = (function(){
  var exports = {};
  ${index}
  return exports;
})();`;
  await Deno.writeTextFile(dir_npm + "/index.js", out);
  // browser min
  await esbuild.build({
    logLevel: "silent",
    platform: "neutral",
    minify: true,
    entryPoints: [dir_npm + "/index.js"],
    outfile: dir_npm + "/index.min.js",
    sourcemap: true,
  });

  await Deno.writeTextFile(
    dir_npm + "/package.json",
    `{
  "name": "van-router",
  "description": "A small router middleware for vanillajs.",
  "version": "${VERSION}",
  "main": "index.node.js",
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
