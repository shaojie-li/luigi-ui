import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { build } from "vite";
import { compile } from "tailwindcss";

const root = resolve(import.meta.dirname, "..");
const run = promisify(execFile);

await test("真实安装包可无 Tailwind 消费，类型可解析，JS 可树摇且 CSS 不丢失", async (t) => {
  const temp = await mkdtemp(join(tmpdir(), "luigi-ui-package-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  await run("npm", ["pack", "--ignore-scripts", "--pack-destination", temp], {
    cwd: root,
  });
  const archive = (await readdir(temp)).find((name) => name.endsWith(".tgz"));
  assert.ok(archive);
  const installed = join(temp, "node_modules/luigi-ui");
  await mkdir(installed, { recursive: true });
  await run("tar", [
    "-xzf",
    join(temp, archive),
    "--strip-components=1",
    "-C",
    installed,
  ]);
  const contents = await readdir(installed);
  assert.deepEqual(contents.sort(), [
    "LICENSE",
    "README.md",
    "dist",
    "package.json",
  ]);
  for (const dependency of [
    "react",
    "react-dom",
    "@types/react",
    "@types/react-dom",
    "@base-ui/react",
    "clsx",
    "tailwind-merge",
    "tailwind-variants",
    "lucide-react",
  ]) {
    const target = join(temp, "node_modules", dependency);
    await mkdir(dirname(target), { recursive: true });
    await symlink(join(root, "node_modules", dependency), target, "dir");
  }
  await writeFile(
    join(temp, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  await writeFile(
    join(temp, "types.tsx"),
    `
import { Button, Spinner, type ButtonProps, type ButtonTone, type ButtonVariant } from "luigi-ui";
export const spinner = <Spinner size={24} />;
export const button = <Button onAsyncClick={async () => {}} onAsyncError={() => {}}>保存</Button>;
export const props: ButtonProps = { children: "保存" };
export const tone: ButtonTone = "danger";
export const variant: ButtonVariant = "outline";
export const semanticButton = <Button tone={tone} variant={variant}>删除</Button>;
// @ts-expect-error 语义颜色不接受任意色板名称。
export const invalidTone = <Button tone="red">错误颜色</Button>;
// @ts-expect-error 变体仅提供已支持的四种外观。
export const invalidVariant = <Button variant="ghost">错误变体</Button>;
// @ts-expect-error 异步操作必须提供错误处理。
export const invalid = <Button onAsyncClick={async () => {}}>保存</Button>;
`,
  );
  await run(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--target",
      "ES2023",
      "--jsx",
      "react-jsx",
      "--types",
      "react",
      "types.tsx",
    ],
    { cwd: temp },
  );
  await writeFile(
    join(temp, "entry.ts"),
    `import "luigi-ui/styles.css"; export { Spinner } from "luigi-ui";`,
  );
  const bundledModules: string[] = [];
  await build({
    root: temp,
    configFile: false,
    logLevel: "silent",
    plugins: [
      {
        name: "inspect-consumer-bundle",
        generateBundle(_options, bundle) {
          for (const output of Object.values(bundle)) {
            if (output.type === "chunk")
              bundledModules.push(...Object.keys(output.modules));
          }
        },
      },
    ],
    build: {
      minify: false,
      lib: {
        entry: join(temp, "entry.ts"),
        formats: ["es"],
        fileName: "consumer",
      },
    },
  });
  const bundle = await readFile(join(temp, "dist/consumer.js"), "utf8");
  assert.match(bundle, /lui-spinner/);
  assert.doesNotMatch(bundle, /onAsyncClick|inFlight|data-loading/);
  assert.ok(
    !bundledModules.some(
      (id) => id.includes("@base-ui") || id.includes("/button/Button.js"),
    ),
  );
  const cssFile = (await readdir(join(temp, "dist"))).find((name) =>
    name.endsWith(".css"),
  );
  assert.ok(cssFile, "CSS 副作用不能被树摇删除");
  const css = await readFile(join(temp, "dist", cssFile), "utf8");
  assert.ok(css.includes(".lui\\:px-4"));
  assert.ok(css.includes(".lui\\:animate-spin"));
  assert.doesNotMatch(
    css,
    /@theme|@apply|@tailwind|--color-(?:red|slate|teal)-/,
  );
  assert.doesNotMatch(css, /box-sizing:border-box[^}]*\*|button,input,select/);
  assert.doesNotMatch(
    css,
    /--(?:spacing|radius-lg|text-sm|font-weight-medium):|@property --tw-/,
  );
  const buttonModule = await readFile(
    join(installed, "dist/components/button/Button.js"),
    "utf8",
  );
  assert.match(buttonModule, /^"use client"/);
  assert.doesNotMatch(buttonModule, /import.*\.css/);
});

await test("所有语义具有完整用途和状态，Tailwind 映射可生成装饰线等变体", async () => {
  const tokens = await readFile(join(root, "src/styles/tokens.css"), "utf8");
  const theme = await readFile(join(root, "dist/theme.css"), "utf8");
  for (const tone of [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
    "accent",
  ]) {
    for (const slot of [
      "solid",
      "on-solid",
      "subtle",
      "text",
      "border",
      "decoration",
    ]) {
      for (const suffix of [
        "",
        "-hover",
        "-active",
        "-focus",
        "-selected",
        "-disabled",
      ]) {
        const name = `ui-${tone}-${slot}${suffix}`;
        assert.ok(tokens.includes(`--${name}:`), name);
        assert.ok(theme.includes(`--color-${name}: var(--${name});`), name);
      }
    }
    assert.ok(tokens.includes(`--ui-${tone}-focus-ring:`));
  }
  const compiler = await compile(`${theme}\n@tailwind utilities;`);
  const css = compiler.build([
    "bg-ui-success-subtle",
    "hover:text-ui-danger-text-hover",
    "focus-visible:border-ui-warning-border-focus",
    "focus-visible:decoration-ui-info-decoration-focus",
    "outline-ui-primary-focus-ring",
    "bg-red-500",
  ]);
  for (const variable of [
    "success-subtle",
    "danger-text-hover",
    "warning-border-focus",
    "info-decoration-focus",
    "primary-focus-ring",
  ]) {
    assert.ok(css.includes(`var(--ui-${variable})`), variable);
  }
  assert.doesNotMatch(css, /bg-red-500/);
});
