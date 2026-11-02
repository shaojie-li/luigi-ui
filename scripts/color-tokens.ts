import assert from "node:assert/strict";
import { format } from "prettier";

type Tokens = Record<string, string>;
const identifier = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const reference = String.raw`var\(--ui-[a-z][a-z0-9-]*\)`;
const colorValue = new RegExp(
  `^(?:#[\\da-fA-F]{6}(?:[\\da-fA-F]{2})?|${reference}|color-mix\\(in srgb, ${reference} (?:100|[1-9]?\\d(?:\\.\\d+)?)%, ${reference}\\))$`,
);

function record(value: unknown, path: string): Record<string, unknown> {
  assert.ok(
    value && typeof value === "object" && !Array.isArray(value),
    `${path} 必须是对象`,
  );
  return Object.fromEntries(Object.entries(value));
}

function tokens(value: unknown, path: string): Tokens {
  const result: Tokens = {};
  for (const [name, expression] of Object.entries(record(value, path))) {
    assert.ok(identifier.test(name), `${path}.${name} 名称无效`);
    assert.equal(
      typeof expression,
      "string",
      `${path}.${name} 必须是颜色表达式`,
    );
    if (typeof expression === "string") result[name] = expression;
  }
  return result;
}

function validateGraph(values: Tokens) {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  function visit(name: string) {
    if (visited.has(name)) return;
    assert.ok(!visiting.has(name), `颜色引用形成循环：${name}`);
    const value = values[name];
    assert.ok(value !== undefined, `颜色引用不存在：${name}`);
    assert.ok(colorValue.test(value), `颜色表达式无效：${name} = ${value}`);
    visiting.add(name);
    for (const match of value.matchAll(/var\(--ui-([a-z0-9-]+)\)/g)) {
      if (match[1]) visit(match[1]);
    }
    visiting.delete(name);
    visited.add(name);
  }
  for (const name of Object.keys(values)) visit(name);
}

function declarations(values: Tokens) {
  return Object.entries(values)
    .map(([name, value]) => `--ui-${name}: ${value};`)
    .join("\n");
}

/** 只编译颜色数据；不生成组件选择器、状态行为或组件类名。 */
export async function compileColors(input: unknown) {
  const data = record(input, "colors");
  assert.deepEqual(Object.keys(data).sort(), [
    "modes",
    "semantic",
    "shared",
    "themes",
    "tones",
    "version",
  ]);
  assert.equal(data.version, 1, "不支持的颜色格式版本");
  assert.ok(
    Array.isArray(data.tones) && data.tones.length > 0,
    "tones 不能为空",
  );
  const tones: string[] = [];
  for (const tone of data.tones) {
    assert.ok(
      typeof tone === "string" && identifier.test(tone),
      "tone 名称无效",
    );
    assert.ok(!tones.includes(tone), `重复 tone：${tone}`);
    tones.push(tone);
  }
  const modes = record(data.modes, "modes");
  assert.deepEqual(Object.keys(modes).sort(), ["dark", "light"]);
  const light = tokens(modes.light, "modes.light");
  const dark = tokens(modes.dark, "modes.dark");
  assert.deepEqual(
    Object.keys(light).sort(),
    Object.keys(dark).sort(),
    "明暗模式必须提供相同基础变量",
  );
  const derived = tokens(data.shared, "shared");
  for (const [slot, expression] of Object.entries(
    tokens(data.semantic, "semantic"),
  )) {
    for (const tone of tones) {
      const name = `${tone}-${slot}`;
      assert.ok(!(name in derived), `重复颜色变量：${name}`);
      derived[name] = expression.replaceAll("{tone}", tone);
    }
  }
  for (const name of Object.keys(derived))
    assert.ok(!(name in light), `基础色与语义色重名：${name}`);
  validateGraph({ ...light, ...derived });
  validateGraph({ ...dark, ...derived });

  const blocks = [
    `:root, [data-ui-mode="light"] { color-scheme: light; ${declarations(light)} }`,
    `[data-ui-mode="dark"] { color-scheme: dark; ${declarations(dark)} }`,
  ];
  const themes = record(data.themes, "themes");
  assert.ok("default" in themes, "必须提供 default 主题");
  for (const [name, theme] of Object.entries(themes)) {
    assert.ok(identifier.test(name), `主题名无效：${name}`);
    const variants = record(theme, `themes.${name}`);
    assert.deepEqual(
      Object.keys(variants).sort(),
      ["dark", "light"],
      `主题 ${name} 必须提供 light 和 dark`,
    );
    for (const mode of ["light", "dark"]) {
      const overrides = tokens(variants[mode], `themes.${name}.${mode}`);
      for (const key of Object.keys(overrides))
        assert.ok(key in light, `未知主题基础变量：${key}`);
      const base = mode === "light" ? light : dark;
      const values = { ...base, ...overrides };
      validateGraph({ ...values, ...derived });
      let selector = `[data-ui-theme="${name}"][data-ui-mode="${mode}"]`;
      if (mode === "light")
        selector += `, [data-ui-theme="${name}"]:not([data-ui-mode])`;
      blocks.push(
        `${selector} { color-scheme: ${mode}; ${declarations(values)} }`,
      );
    }
  }
  blocks.push(`/* 每个主题边界重新求值，避免继承父级已计算的别名。 */
    :root, [data-ui-theme], [data-ui-mode] { ${declarations(derived)} }`);
  const header =
    "/* 自动生成，请勿手动修改。源文件：colors.json；运行 pnpm colors:generate。 */\n";
  const publicNames = [
    ...Object.keys(light).filter(
      (name) =>
        !name.startsWith("palette-") &&
        name !== "on-solid" &&
        name !== "state-mix",
    ),
    ...Object.keys(derived),
  ];
  return {
    tokens: await format(`${header}@layer theme { ${blocks.join("\n")} }`, {
      parser: "css",
    }),
    theme: await format(
      `${header}@theme inline { ${publicNames.map((name) => `--color-ui-${name}: var(--ui-${name});`).join("\n")} }`,
      { parser: "css" },
    ),
  };
}
