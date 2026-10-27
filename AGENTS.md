# 项目约定

- 默认中文沟通。资产按职责独立维护，通过 lt 安装。
- 使用 TypeScript strict、ESM 和 pnpm；profile-web-interaction 保留 Python。
- 修改资产后运行 pnpm check，分发文件需随源码提交。
- 已发布的版本不可修改；内容变化时提升 catalog.json 中对应资产版本。
- 不擅自提交、推送或发布。
- 面向应用组件，基础交互复用 Base UI；业务请求、路由和持久化由消费项目负责。
- 使用 Storybook 预览。story 放在 stories/，直接引用资产源码，不放进可分发目录；新增组件需有对应使用场景。
- 组件源码放在 src/components/<asset>/；安装位置由 catalog.json 的 targetDirectory 声明，不在每个资产下重复消费项目的 src/components/ 层级。
- 内部工具放在 src/_utils/，内部 Hook 放在 src/_hooks/；下划线表示内部实现，不作为公开组件入口。
- 组件实现使用与主要导出组件同名的 PascalCase 文件，如 src/components/button/Button.tsx；资产目录同名不要求改为 index.tsx。index.tsx 仅作为可选目录入口，main.tsx 仅作为启动入口。目录命名统一由 check-file/folder-naming-convention 检查，允许小写字母开头或单个下划线后接小写字母，不在 React 规则中重复维护。
- 修改预览配置或组件后运行 pnpm build-storybook；静态构建不执行 play，关键交互需在浏览器验证。

## 代码规范与验证

- 修改代码前，读取 eslint.config.ts、tooling/ 中相关规则以及适用的 TypeScript、Prettier 配置，按现有规则编写代码。
- 可机器检查的规范以实际配置为准，不在文档中重复维护完整规则列表；文档仅补充规则原因、示例和工具无法检查的约定。
- 交付代码前必须通过 pnpm check。不得为通过检查而关闭规则、扩大忽略范围或使用类型断言绕过错误；无法完成验证时，明确说明具体阻塞和未验证项。
- 每次改动都评估是否形成可复用的项目约定，包括这一评估要求本身；有新增价值时在本次任务中同步更新规范。能自动检查的优先落实到 tooling/ 或现有检查配置，AGENTS.md 保留执行入口与工具无法判断的边界；不把一次性细节和重复结论堆入规范。

## 类名处理

- className、classes 等类名的组合统一使用 src/_utils/cn.ts 导出的 cn，采用 clsx + tailwind-merge；默认类在前，调用方覆盖类在后。固定字符串和已有类名变量可以直接传递。
- 条件类使用 cn 的对象语法，如 cn("基础类", { "状态类": active }, className)；类名表达式中禁止字符串相加、模板插值、数组 join/concat 拼接、三元表达式和短路写法，不用嵌套这些写法绕过检查。
- Base UI 的函数式 className 先根据 state 求值得到类名，再交给 cn 合并；用显式类型判断保留回调语义，不把函数当作 clsx 输入，也不通过三元表达式处理类型分支。
- 按钮正常可操作时显式使用 cursor-pointer；禁用或加载中阻止操作时使用 cursor-not-allowed，鼠标反馈与实际可操作状态一致。

## React Effect 使用边界

- 遵循 [React 官方指南](https://react.dev/learn/you-might-not-need-an-effect)：可从 props 或 state 推导的值直接在渲染时计算；仅在计算成本有实际需要时使用 useMemo，不用 Effect 同步派生状态。
- 用户操作引发的请求、通知和状态变更放在事件处理函数中，不通过状态标志和 Effect 串联；业务请求仍由消费项目负责。
- 与浏览器 API、第三方组件等外部系统同步时允许使用 useEffect；声明完整依赖，按需提供清理，确保依赖变化、卸载和 Strict Mode 的额外 setup/cleanup 后仍然正确。
- 不为避免直接使用 useEffect 而增加通用 useMountEffect 包装，不关闭依赖检查，也不用 hasRun ref 掩盖重复执行；只有存在明确的可复用同步行为时才提取自定义 Hook。
- 仅在业务语义确实要求重置整个子树时使用 key 重挂载，评估焦点、输入和局部状态丢失的影响；外部 store 订阅优先使用 useSyncExternalStore。
