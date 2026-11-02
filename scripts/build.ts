import { execFile } from "node:child_process";
import { copyFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const root = resolve(import.meta.dirname, "..");
const run = promisify(execFile);

await rm(resolve(root, "dist"), { recursive: true, force: true });
await run(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"],
  { cwd: root },
);
await run(
  process.execPath,
  [
    "node_modules/@tailwindcss/cli/dist/index.mjs",
    "-i",
    "src/styles/index.css",
    "-o",
    "dist/styles.css",
    "--minify",
  ],
  { cwd: root },
);
await copyFile(
  resolve(root, "src/styles/theme.css"),
  resolve(root, "dist/theme.css"),
);
console.log("已构建 ESM、类型声明、组件 CSS 和可选 Tailwind 主题映射");
