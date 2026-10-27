// Limit the restriction to class-producing expressions, including callbacks.
// Plain strings and variables remain valid; cn owns composition and conditions.
const contexts = [
  "JSXAttribute[name.name=/^(className|classNames|classes)$/]",
  "VariableDeclarator[id.name=/([Cc]lassNames?|[Cc]lasses)$/]",
  "AssignmentPattern[left.name=/([Cc]lassNames?|[Cc]lasses)$/]",
  "Property[key.name=/([Cc]lassNames?|[Cc]lasses)$/]",
  "Property[key.value=/([Cc]lassNames?|[Cc]lasses)$/]",
  "AssignmentExpression[left.name=/([Cc]lassNames?|[Cc]lasses)$/]",
  "AssignmentExpression[left.property.name=/([Cc]lassNames?|[Cc]lasses)$/]",
  "CallExpression[callee.name='cn']",
];

const expressions = [
  "BinaryExpression[operator='+']",
  "AssignmentExpression[operator='+=']",
  "TemplateLiteral[expressions.length>0]",
  "ConditionalExpression",
  "LogicalExpression",
  "CallExpression[callee.property.name=/^(join|concat)$/]",
];

const selectors = expressions.map((expression) =>
  contexts.map((context) => `${context} ${expression}`).join(", "),
);
selectors.push(
  "AssignmentExpression[operator='+='][left.name=/([Cc]lassNames?|[Cc]lasses)$/], AssignmentExpression[operator='+='][left.property.name=/([Cc]lassNames?|[Cc]lasses)$/]",
);

export const classNameRules = selectors.map((selector) => ({
  selector,
  message:
    '类名组合请使用 cn("基础类", { "状态类": condition }, className)，禁止字符串拼接、join/concat、三元或短路写法。',
}));
