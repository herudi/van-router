const dir = Deno.cwd();
const dir_npm = dir + "/npm";
try {
  await Deno.remove(dir_npm, { recursive: true });
} catch (_e) { /* noop */ }

try {
  await Deno.mkdir(dir_npm, { recursive: true });
} catch (_e) { /* noop */ }
