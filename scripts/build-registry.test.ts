import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

await test("构建保留历史版本、拒绝覆盖和不完整元数据；检查模式不写入", async (t) => {
  const root = resolve(import.meta.dirname, "..");
  const temp = await mkdtemp(join(tmpdir(), "luigi-publish-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  await mkdir(join(temp, "scripts"));
  await mkdir(join(temp, "skill"));
  await copyFile(
    join(root, "scripts/build-registry.ts"),
    join(temp, "scripts/build-registry.ts"),
  );
  await writeFile(join(temp, "package.json"), '{"type":"module"}');
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  const skill = join(temp, "skill/SKILL.md");
  const initial = "---\nname: forms\ndescription: 测试\n---\n第一版\n";
  await writeFile(skill, initial);
  const catalog = {
    entries: [
      {
        type: "skill",
        name: "forms",
        description: "测试",
        version: "1.0.0",
        directory: "skill",
        requires: [],
      },
    ],
  };
  const save = () =>
    writeFile(join(temp, "catalog.json"), JSON.stringify(catalog));
  await save();
  const build = (...args: string[]) =>
    execFileSync(
      process.execPath,
      [
        "--import",
        import.meta.resolve("tsx"),
        join(temp, "scripts/build-registry.ts"),
        ...args,
      ],
      { cwd: temp, encoding: "utf8", stdio: "pipe" },
    );
  build();
  build("--check");
  const index = join(temp, "registry/index.json");
  const before = await readFile(index, "utf8");
  await writeFile(skill, initial + "第二版\n");
  assert.throws(() => build(), /版本已存在且内容不同/);
  assert.equal(await readFile(index, "utf8"), before);
  catalog.entries[0]!.version = "2.0.0";
  await save();
  assert.throws(() => build("--check"));
  assert.equal(await readFile(index, "utf8"), before);
  build();
  build("--check");
  const published = JSON.parse(await readFile(index, "utf8")) as {
    entries: { version: string; url: string }[];
  };
  assert.deepEqual(
    published.entries.map((e) => e.version),
    ["1.0.0", "2.0.0"],
  );
  assert.match(
    await readFile(join(temp, "registry", published.entries[0]!.url), "utf8"),
    /第一版/,
  );
  await writeFile(skill, "没有 frontmatter");
  assert.throws(() => build(), /缺少元数据/);
});

await test("扁平源码映射到安装目录，保持快照和版本兼容并拒绝非法目标路径", async (t) => {
  const root = resolve(import.meta.dirname, "..");
  const temp = await mkdtemp(join(tmpdir(), "luigi-ui-paths-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  await mkdir(join(temp, "scripts"));
  await copyFile(
    join(root, "scripts/build-registry.ts"),
    join(temp, "scripts/build-registry.ts"),
  );
  await writeFile(join(temp, "package.json"), '{"type":"module"}');
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  const legacy = join(temp, "legacy/src/components/ui");
  await mkdir(join(legacy, "internal"), { recursive: true });
  await writeFile(
    join(legacy, "Button.tsx"),
    "export const Button = () => null;\n",
  );
  await writeFile(
    join(legacy, "internal/helper.ts"),
    "export const size = 1;\n",
  );
  const entry = {
    type: "ui",
    name: "button",
    description: "测试按钮",
    version: "0.1.0",
    directory: "legacy",
    targetDirectory: undefined as string | undefined,
  };
  const save = () =>
    writeFile(join(temp, "catalog.json"), JSON.stringify({ entries: [entry] }));
  const build = (...args: string[]) =>
    execFileSync(
      process.execPath,
      [
        "--import",
        import.meta.resolve("tsx"),
        join(temp, "scripts/build-registry.ts"),
        ...args,
      ],
      { cwd: temp, encoding: "utf8", stdio: "pipe" },
    );
  await save();
  build();
  const index = join(temp, "registry/index.json");
  const before = await readFile(index, "utf8");
  const published = JSON.parse(before) as { entries: { url: string }[] };
  const snapshot = join(temp, "registry", published.entries[0]!.url);
  const payload = await readFile(snapshot, "utf8");
  await rename(legacy, join(temp, "flat"));
  entry.directory = "flat";
  entry.targetDirectory = "src/components/ui";
  await save();
  build("--check");
  build();
  assert.equal(await readFile(index, "utf8"), before);
  assert.equal(await readFile(snapshot, "utf8"), payload);
  const item = JSON.parse(payload) as {
    assets: { files: { path: string }[] }[];
  };
  assert.deepEqual(item.assets[0]!.files.map((file) => file.path).sort(), [
    "src/components/ui/Button.tsx",
    "src/components/ui/internal/helper.ts",
  ]);
  for (const target of [
    "../outside",
    "/absolute",
    "src/../outside",
    "src\\ui",
    "src//ui",
    "",
  ]) {
    entry.targetDirectory = target;
    await save();
    assert.throws(() => build(), /ZodError/);
    assert.equal(await readFile(index, "utf8"), before);
  }
});

await test("当前组件及工具依赖可独立安装，不依赖仓库的 rootDirs 或 alias", async (t) => {
  const root = resolve(import.meta.dirname, "..");
  const temp = await mkdtemp(join(tmpdir(), "luigi-ui-install-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const catalog = JSON.parse(
    await readFile(join(root, "catalog.json"), "utf8"),
  ) as {
    entries: { type: string; name: string; version: string }[];
  };
  interface Entry {
    type: string;
    name: string;
    version: string;
    url: string;
    requires: { key: string; version: string }[];
  }
  const index = JSON.parse(
    await readFile(join(root, "registry/index.json"), "utf8"),
  ) as {
    entries: Entry[];
  };
  const installed = new Set<string>();
  const dependencies: Record<string, string> = {};
  async function install(key: string, version: string): Promise<void> {
    const identity = `${key}@${version}`;
    if (installed.has(identity)) return;
    const entry = index.entries.find(
      (item) => `${item.type}/${item.name}@${item.version}` === identity,
    );
    assert.ok(entry, `缺少依赖 ${identity}`);
    installed.add(identity);
    for (const requirement of entry.requires) {
      await install(requirement.key, requirement.version);
    }
    const snapshot = JSON.parse(
      await readFile(join(root, "registry", entry.url), "utf8"),
    ) as {
      assets: {
        dependencies: Record<string, string>;
        files: { path: string; content: string }[];
      }[];
    };
    for (const asset of snapshot.assets) {
      Object.assign(dependencies, asset.dependencies);
      for (const file of asset.files) {
        const path = join(temp, file.path);
        await mkdir(resolve(path, ".."), { recursive: true });
        await writeFile(path, file.content);
      }
    }
  }
  const button = catalog.entries.find(
    (entry) => entry.type === "ui" && entry.name === "button",
  );
  assert.ok(button);
  await install("ui/button", button.version);
  assert.ok(dependencies.clsx);
  assert.ok(dependencies["tailwind-merge"]);
  assert.ok(dependencies["lucide-react"]);
  await writeFile(
    join(temp, "package.json"),
    JSON.stringify({ type: "module", dependencies }),
  );
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  await writeFile(
    join(temp, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        exactOptionalPropertyTypes: true,
        skipLibCheck: true,
        jsx: "react-jsx",
        noEmit: true,
      },
      include: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  );
  execFileSync(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "-p",
      join(temp, "tsconfig.json"),
    ],
    { cwd: temp, encoding: "utf8", stdio: "pipe" },
  );
});
