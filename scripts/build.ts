import * as esbuild from "https://deno.land/x/esbuild@v0.14.25/mod.js";

const VERSION = "0.5.5";

const dir = Deno.cwd();
const dir_npm = dir + "/npm";

try {
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
  // browser
  const myCode = await esbuild.build({
    logLevel: "silent",
    format: "iife",
    platform: "browser",
    minify: true,
    entryPoints: [dir_npm + "/index.js"],
    globalName: "__23van",
    write: false,
  });
  const load_index = await Deno.readTextFile(dir_npm + "/index.js");
  await Deno.writeTextFile(
    dir_npm + "/index.js",
    `if (typeof window !== "undefined") window.exports = {};
    ${load_index}
  `,
  );
  const code = myCode.outputFiles[0].text;
  const min_code = await esbuild.transform(
    code.replace("\n", "") + "var VanRouter = __23van.VanRouter;",
    {
      minify: true,
    },
  );
  await Deno.writeTextFile(dir_npm + "/index.min.js", min_code.code);
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
