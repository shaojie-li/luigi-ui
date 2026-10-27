import assert from "node:assert/strict";
import test from "node:test";
import { Linter } from "eslint";
import checkFile from "eslint-plugin-check-file";
import { sourceFolderPattern } from "../tooling/eslint-rules.js";
import { classNameRules } from "../tooling/class-name-rules.js";
import { reactNaming } from "../tooling/react-naming.js";

const linter = new Linter();
const config: Linter.Config = {
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  rules: { "no-restricted-syntax": ["error", ...classNameRules] },
};

await test("类名规则拦截 JSX、变量、属性、回调和 cn 参数中的手工拼接", () => {
  const invalid = [
    '<div className={"base " + extra} />;',
    "<div className={`base ${extra}`} />;",
    '<div className={active ? "on" : "off"} />;',
    '<div className={active && "on"} />;',
    '<div className={extra || "fallback"} />;',
    '<div className={extra ?? "fallback"} />;',
    'const classes = active ? "on" : "off";',
    'const classNames = active ? "on" : "off";',
    'const { className = active ? "on" : "off" } = props;',
    'const buttonClassName = "base " + extra;',
    'const props = { classes: { root: active && "on" } };',
    'const props = { "className": `base ${extra}` };',
    'const props = { className: state => state.disabled ? "off" : "on" };',
    'className = "base " + extra;',
    'props.className = active && "on";',
    'classes += " extra";',
    'props.className += " extra";',
    'const classes = ["base", extra].join(" ");',
    'const classes = "base".concat(extra);',
    'cn("base", active && "on");',
    'cn("base", active ? "on" : "off");',
  ];
  for (const code of invalid) {
    const messages = linter.verify(code, config);
    assert.ok(
      messages.some((message) => message.ruleId === "no-restricted-syntax"),
      code,
    );
    assert.ok(!messages.some((message) => message.fatal), code);
  }
});

await test("类名规则允许 cn 对象条件、固定类名和普通业务表达式", () => {
  const valid = [
    '<div className="base" />;',
    "<div className={className} />;",
    '<div className={cn("base", { on: active, off: !active }, className)} />;',
    'const classes = cn("base", { on: active }, extra);',
    'const props = { classes: { root: cn("base", { on: active }) } };',
    "const props = { className: state => cn({ off: state.disabled }) };",
    'const props = { className: state => { let result; if (typeof className === "function") { result = className(state); } else { result = className; } return cn("base", result); } };',
    'const message = active ? "成功" : "失败";',
    "const busy = disabled || pending;",
    'const label = "保存" + count;',
    'const text = ["a", "b"].join(" ");',
    "active && save();",
  ];
  for (const code of valid) {
    assert.deepEqual(linter.verify(code, config), [], code);
  }
});

await test("组件实现保留同名 PascalCase 文件，index 仅为可选入口", () => {
  const rules: Linter.Config = {
    ...config,
    files: ["**/*.tsx"],
    plugins: { local: { rules: { "react-naming": reactNaming } } },
    rules: { "local/react-naming": "error" },
  };
  const valid = [
    {
      filename: "src/components/button/Button.tsx",
      code: "export function Button() { return <button />; }",
    },
    {
      filename: "src/components/spinner/Spinner.tsx",
      code: "export default function Spinner() { return <svg />; }",
    },
    {
      filename: "src/components/button/index.tsx",
      code: 'export { Button } from "./Button.js";',
    },
    {
      filename: "src/components/button/index.tsx",
      code: "export function Button() { return <button />; }",
    },
    {
      filename: "stories/Button.stories.tsx",
      code: "export function Default() { return <button />; }",
    },
  ];
  for (const { filename, code } of valid) {
    assert.deepEqual(linter.verify(code, rules, { filename }), [], filename);
  }
  const invalid = [
    {
      filename: "src/components/button/button.tsx",
      code: "export function Button() { return <button />; }",
      messageId: "filename",
    },
    {
      filename: "src/components/button/Button.tsx",
      code: "export function Spinner() { return <svg />; }",
      messageId: "implementation",
    },
    {
      filename: "src/components/button/index.tsx",
      code: "export function Other() { return <button />; }",
      messageId: "entry",
    },
    {
      filename: "src/main.tsx",
      code: "export function App() { return <div />; }",
      messageId: "bootstrap",
    },
  ];
  for (const { filename, code, messageId } of invalid) {
    const messages = linter.verify(code, rules, { filename });
    assert.ok(
      messages.some((message) => message.messageId === messageId),
      filename,
    );
    assert.ok(!messages.some((message) => message.fatal), filename);
  }
});

await test("check-file 原规则支持内部下划线目录，并对 TS 和 TSX 拦截非法前缀", () => {
  const rules: Linter.Config = {
    files: ["**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/folder-naming-convention": [
        "error",
        { "**/src/**/": sourceFolderPattern },
      ],
    },
  };
  const code = "export const value = 1;";
  const valid = [
    "src/_utils/cn.ts",
    "src/_hooks/use-example.ts",
    "src/components/button/Button.tsx",
    "src/components/_shared/Example.tsx",
    "src/_utils/nested/helper.ts",
    "src/internalTools/helper.ts",
  ];
  for (const filename of valid) {
    assert.deepEqual(linter.verify(code, rules, { filename }), [], filename);
  }
  const invalid = [
    "src/Utils/cn.ts",
    "src/_Utils/cn.ts",
    "src/__utils/cn.ts",
    "src/_/cn.ts",
    "src/1utils/cn.ts",
    "src/components/Bad/Example.tsx",
    "src/_hooks/Bad/use-example.ts",
    "src/__internal/Example.tsx",
  ];
  for (const filename of invalid) {
    const messages = linter.verify(code, rules, { filename });
    assert.ok(
      messages.some(
        (message) => message.ruleId === "check-file/folder-naming-convention",
      ),
      filename,
    );
    assert.ok(!messages.some((message) => message.fatal), filename);
  }
});
