import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileColors } from "./color-tokens.js";

const directory = resolve(import.meta.dirname, "../src/styles");
const input: unknown = JSON.parse(
  await readFile(resolve(directory, "colors.json"), "utf8"),
);
const output = await compileColors(input);
for (const [name, css] of Object.entries(output)) {
  const file = resolve(directory, `${name}.css`);
  if (process.argv.includes("--check")) {
    if ((await readFile(file, "utf8")) !== css) {
      throw new Error(
        `${name}.css 与 colors.json 不一致。请运行 pnpm colors:generate，禁止手改生成文件。`,
      );
    }
  } else {
    await writeFile(file, css);
  }
}
