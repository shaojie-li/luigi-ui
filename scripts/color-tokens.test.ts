import assert from "node:assert/strict";
import test from "node:test";
import { compileColors } from "./color-tokens.js";

function fixture() {
  return {
    version: 1,
    tones: ["primary"],
    modes: {
      light: { canvas: "#ffffff", "palette-primary": "#3659c9" },
      dark: { canvas: "#141a23", "palette-primary": "#a8baff" },
    },
    themes: {
      default: { light: {}, dark: {} },
      ocean: {
        light: { "palette-primary": "#166c90" },
        dark: { "palette-primary": "#89cfe9" },
      },
    },
    shared: {},
    semantic: {
      solid: "var(--ui-palette-{tone})",
      "solid-hover":
        "color-mix(in srgb, var(--ui-{tone}-solid) 88%, var(--ui-canvas))",
    },
  };
}

await test("JSON 编译可复现，扩展主题不需要修改生成器", async () => {
  const input = fixture();
  const output = await compileColors(input);
  assert.deepEqual(output, await compileColors(input));
  const extended = await compileColors({
    ...input,
    themes: {
      ...input.themes,
      forest: {
        light: { "palette-primary": "#187345" },
        dark: { "palette-primary": "#85d6a4" },
      },
    },
  });
  assert.match(
    extended.tokens,
    /\[data-ui-theme="forest"\]\[data-ui-mode="dark"\]/,
  );
  assert.match(output.tokens, /--ui-primary-solid-hover: color-mix/);
  assert.match(
    output.theme,
    /--color-ui-primary-solid: var\(--ui-primary-solid\)/,
  );
  assert.doesNotMatch(output.theme, /palette-primary/);
});

await test("拒绝缺失引用、循环引用和无效颜色，不能静默生成失效 CSS", async () => {
  const missing = fixture();
  missing.semantic.solid = "var(--ui-missing)";
  await assert.rejects(compileColors(missing), /颜色引用不存在/);
  const circular = fixture();
  circular.semantic.solid = "var(--ui-primary-solid-hover)";
  await assert.rejects(compileColors(circular), /形成循环/);
  for (const value of [
    "red",
    "#fff; color: red",
    "url(https://example.com)",
    "color-mix(in srgb, var(--ui-primary-solid) 100.1%, var(--ui-canvas))",
  ]) {
    const invalid = fixture();
    invalid.semantic["solid-hover"] = value;
    await assert.rejects(compileColors(invalid), /颜色表达式无效/);
  }
});

await test("主题名、明暗覆盖键和格式版本必须有效", async () => {
  const input = fixture();
  await assert.rejects(compileColors({ ...input, version: 2 }), /格式版本/);
  await assert.rejects(
    compileColors({
      ...input,
      themes: { ...input.themes, 'bad"]': input.themes.ocean },
    }),
    /主题名无效/,
  );
  await assert.rejects(
    compileColors({
      ...input,
      themes: { default: { light: { typo: "#ffffff" }, dark: {} } },
    }),
    /未知主题基础变量/,
  );
  await assert.rejects(
    compileColors({ ...input, themes: { default: { light: {} } } }),
    /必须提供 light 和 dark/,
  );
});
