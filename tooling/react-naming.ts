import type { Rule } from "eslint";

// ESLint's ESTree types do not include TypeScript expressions. Read only the
// small shared AST shape needed here; visitorKeys also covers TS wrappers.
interface AstNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  [key: string]: unknown;
}

function asNode(value: unknown): AstNode | undefined {
  return typeof value === "object" && value !== null && "type" in value
    ? (value as AstNode)
    : undefined;
}

function identifier(value: unknown): string | undefined {
  const node = asNode(value);
  return node?.type === "Identifier" && typeof node.name === "string"
    ? node.name
    : undefined;
}

const pascalCase = /^[A-Z][A-Za-z0-9]*$/;
const functions = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const reactNaming: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "组件实现使用同名 PascalCase 文件；index.tsx 仅为可选目录入口",
    },
    schema: [],
    messages: {
      filename:
        "React 实现文件使用 PascalCase（如 button/Button.tsx），不因目录同名而强制改为 index.tsx；index.tsx 和 main.tsx 为入口例外。",
      component: "组件「{{name}}」必须使用 PascalCase（如 TaskDialog）。",
      implementation:
        "组件实现文件「{{filename}}」应导出同名组件「{{expected}}」；index.tsx 仅用于可选的目录入口。",
      entry:
        "组件目录「{{folder}}」的 index.tsx 应导出同名组件「{{expected}}」。",
      anonymous: "默认导出的组件必须有明确的 PascalCase 名称，便于调试和重构。",
      bootstrap:
        "main.tsx 只作为启动入口，请将组件定义移到 PascalCase 文件或组件目录中。",
    },
  },
  create(context) {
    const parts = context.filename.replaceAll("\\", "/").split("/");
    const filename = parts.at(-1) ?? "";
    if (!/\.[jt]sx$/.test(filename)) {
      return {};
    }
    const basename = filename.split(".")[0] ?? "";
    const isIndex = /^index\.[jt]sx$/.test(filename);
    const isMain = /^main\.[jt]sx$/.test(filename);
    const isStory = /\.(stories|story)\.[jt]sx$/.test(filename);
    const folder = parts.at(-2) ?? "";
    const expected = folder.charAt(0).toUpperCase() + folder.slice(1);

    function children(node: AstNode): AstNode[] {
      return (context.sourceCode.visitorKeys[node.type] ?? []).flatMap(
        (key) => {
          const value = node[key];
          return (Array.isArray(value) ? value : [value]).flatMap(
            (child: unknown) => {
              const found = asNode(child);
              return found ? [found] : [];
            },
          );
        },
      );
    }

    function hasJsx(node: AstNode): boolean {
      return (
        ["JSXElement", "JSXFragment"].includes(node.type) ||
        children(node).some(hasJsx)
      );
    }

    function returnsJsx(node: AstNode): boolean {
      if (node.type === "ReturnStatement") {
        const argument = asNode(node.argument);
        return argument !== undefined && hasJsx(argument);
      }
      // A nested callback returning JSX does not turn its outer function into a component.
      return !functions.has(node.type) && children(node).some(returnsJsx);
    }

    function componentValue(node: AstNode | undefined): boolean {
      if (!node) {
        return false;
      }
      if (
        [
          "TSAsExpression",
          "TSSatisfiesExpression",
          "TSNonNullExpression",
        ].includes(node.type)
      ) {
        return componentValue(asNode(node.expression));
      }
      if (functions.has(node.type)) {
        const body = asNode(node.body);
        return (
          body !== undefined &&
          (body.type === "BlockStatement" ? returnsJsx(body) : hasJsx(body))
        );
      }
      if (node.type === "CallExpression") {
        const callee = asNode(node.callee);
        const name = identifier(callee) ?? identifier(callee?.property);
        return name === "memo" || name === "forwardRef";
      }
      if (node.type === "ClassDeclaration" || node.type === "ClassExpression") {
        const parent = asNode(node.superClass);
        const name = identifier(parent) ?? identifier(parent?.property);
        return name === "Component" || name === "PureComponent";
      }
      return false;
    }

    return {
      Program(program) {
        const root = program as unknown as AstNode;
        if (!isIndex && !isMain && !pascalCase.test(basename)) {
          context.report({ node: root, messageId: "filename" });
        }
        // Directory naming is owned by check-file/folder-naming-convention for
        // both .ts and .tsx files, including underscore-prefixed internals.

        const declarations = new Map<string, AstNode>();
        const exports: { local: string; publicName: string; node: AstNode }[] =
          [];
        let anonymousDefault: AstNode | undefined;
        for (const statement of children(root)) {
          const exported = [
            "ExportNamedDeclaration",
            "ExportDefaultDeclaration",
          ].includes(statement.type);
          const declaration = exported
            ? asNode(statement.declaration)
            : statement;
          if (declaration?.type === "VariableDeclaration") {
            for (const item of children(declaration)) {
              const name = identifier(item.id);
              const value = asNode(item.init);
              if (name && value) {
                declarations.set(name, value);
                if (exported) {
                  exports.push({ local: name, publicName: name, node: item });
                }
              }
            }
          } else if (declaration) {
            const name = identifier(declaration.id) ?? identifier(declaration);
            if (name) {
              if (declaration.type !== "Identifier") {
                declarations.set(name, declaration);
              }
              if (exported) {
                exports.push({
                  local: name,
                  publicName: name,
                  node: declaration,
                });
              }
            } else if (
              statement.type === "ExportDefaultDeclaration" &&
              componentValue(declaration)
            ) {
              anonymousDefault = declaration;
            }
          }
          if (statement.type === "ExportNamedDeclaration") {
            for (const specifier of children(statement).filter(
              (node) => node.type === "ExportSpecifier",
            )) {
              const local = identifier(specifier.local);
              const publicName = identifier(specifier.exported);
              if (
                local &&
                publicName &&
                specifier.exportKind !== "type" &&
                statement.exportKind !== "type"
              ) {
                exports.push({
                  local,
                  publicName: publicName === "default" ? local : publicName,
                  node: specifier,
                });
              }
            }
          }
        }

        if (anonymousDefault) {
          context.report({ node: anonymousDefault, messageId: "anonymous" });
        }
        let hasComponentExport = false;
        let hasExpectedExport = false;
        let hasFilenameExport = false;
        const checked = new Set<string>();
        for (const entry of exports) {
          // An uppercase re-export may be a component; imported bodies deliberately
          // aren't resolved, so the entry check stays local and deterministic.
          if (
            !componentValue(declarations.get(entry.local)) &&
            !(
              isIndex &&
              !declarations.has(entry.local) &&
              pascalCase.test(entry.local)
            )
          ) {
            continue;
          }
          hasComponentExport = true;
          hasExpectedExport ||= entry.publicName === expected;
          hasFilenameExport ||= entry.publicName === basename;
          for (const name of new Set([entry.local, entry.publicName])) {
            if (!pascalCase.test(name) && !checked.has(name)) {
              context.report({
                node: entry.node,
                messageId: "component",
                data: { name },
              });
              checked.add(name);
            }
          }
        }
        if (isIndex && hasComponentExport && !hasExpectedExport) {
          context.report({
            node: root,
            messageId: "entry",
            data: { folder, expected },
          });
        }
        if (
          !isIndex &&
          !isMain &&
          !isStory &&
          hasComponentExport &&
          !hasFilenameExport
        ) {
          context.report({
            node: root,
            messageId: "implementation",
            data: { filename, expected: basename },
          });
        }
        if (
          isMain &&
          (anonymousDefault || [...declarations.values()].some(componentValue))
        ) {
          context.report({ node: root, messageId: "bootstrap" });
        }
      },
    };
  },
};
