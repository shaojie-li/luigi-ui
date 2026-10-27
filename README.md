# luigi-ui

面向应用开发的 React 组件源码库，通过 [Luigi CLI](https://github.com/shaojie-li/luigi-tools) 按需安装，用 Storybook 开发、预览和记录使用场景。目前提供 Button 和 Spinner 基础组件；应用组件从真实产品场景中提取，按需增加。

## 架构

参考 [shadcn/ui 的源码、示例和分发分离](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/README.md)，保留单包工程和现有 lt 协议，不引入独立文档站、多样式生成或另一套 CLI。

| 层次      | 职责                                             | 约束                                                           |
| --------- | ------------------------------------------------ | -------------------------------------------------------------- |
| 基础组件  | Button 等小型交互单元，复用 Base UI 的无障碍能力 | 只按应用组件需要补充                                           |
| 应用组件  | 组合基础组件，表达可复用的应用交互               | 通过 props、事件和组合插槽接入业务；不绑定接口、路由或全局状态 |
| Storybook | 使用示例、状态展示、属性文档和交互验证           | 直接引用真实源码；示例数据只存在于 story                       |
| Registry  | 资产发现、版本、依赖和源码快照                   | 构建生成，供 lt 安装；不参与运行时渲染                         |

应用组件仍使用 `type: "ui"` 分发，无需新增协议类型。多个组件只有被一起使用、一起维护时才放在同一资产内；独立复用的组件通过 `requires` 声明精确版本依赖。基础组件不反向依赖应用组件。

```text
src/
  components/
    button/                    # 一个可独立安装的资产
      Button.tsx               # 源码直接放在资产目录下
    spinner/
      Spinner.tsx              # 可独立安装的加载指示器
  _utils/                      # 内部工具，不是公开组件入口
    cn.ts                      # clsx + tailwind-merge
  _hooks/                      # 内部 Hook；有实际需求时添加
stories/
  ui/Button.stories.tsx         # 基础组件示例
.storybook/                    # React + Vite + Tailwind CSS 预览环境
catalog.json                   # 人工维护的资产清单
scripts/build-registry.ts       # 校验并生成分发文件
registry/
  index.json                   # lt v2 索引
  items/<sha256>.json           # 可安装源码快照
```

新增应用组件时，源码放在 `src/components/<asset>/`，story 放在 `stories/app/`，标题使用 `应用组件/<Component>`。目录在有实际组件时创建。单文件组件直接放在资产目录下；需要拆分时再增加内部文件或子目录。

源码位置与安装位置分开声明：`directory` 指向资产源码目录，`targetDirectory` 指向消费项目中的安装目录。构建时将目标目录与文件相对路径拼接后写入快照，lt 无需修改。例如 Button 的 `directory` 为 `src/components/button`，`targetDirectory` 为 `src/components/ui`，因此 `Button.tsx` 安装后仍位于 `src/components/ui/Button.tsx`。应用组件可将目标目录设为 `src/components/app/<component>`。未声明目标目录时，直接使用资产内的相对路径。

Story、预览样式和文档放在资产目录之外：构建脚本会收集 `catalog.json` 中 `directory` 下的全部文件。这样消费项目不会收到 Storybook 依赖和示例代码。跨资产复用使用安装后仍成立的相对路径，并用 `requires` 声明依赖；Storybook 可通过 Vite alias 指向依赖资产源码，但分发源码不能引用仓库外壳或 story。

## 开发与验证

使用 Node.js 22.13+ 和 `packageManager` 指定的 pnpm 版本。

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm storybook
```

预览地址为 http://localhost:6006。Button 包含默认、禁用、长文案、受控加载、异步成功、失败重试、取消异步、render/ref 和表单提交场景；Spinner 包含默认、自定义尺寸和配合文案的场景。带 `play` 的示例会验证鼠标与键盘激活、重复触发拦截、错误恢复、可访问名称、宽度、焦点以及根节点 ref。Controls 用于调整属性，Docs 展示用法说明。

```bash
pnpm build             # 生成可安装资产
pnpm check             # lint、格式、源码和 story 类型、分发一致性、构建测试
pnpm build-storybook   # 构建静态预览到 storybook-static/
```

`pnpm check` 不启动浏览器；静态 Storybook 构建也不执行 `play`。交互断言需在浏览器打开对应 story 验证。CI 同时运行 `check` 和 `build-storybook`，静态预览产物不纳入 Git。

新增应用组件时，以实际使用场景写 story，并覆盖适用的加载、空数据、错误、禁用及正常状态；涉及关键交互时添加 `play` 断言。业务请求与持久化由消费项目负责，story 使用明确的示例数据或回调。

## 组件通用属性约定

| 关注点            | 约定与原因                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 类型与原生属性    | 基于实际 Primitive 的 `ComponentProps` 扩展，导出具名 `ButtonProps` / `SpinnerProps`；透传 `id`、`aria-*`、`data-*`、事件和样式，不建立覆盖所有组件的宽泛 Props。                                                                               |
| 组合渲染          | 使用 Base UI 原生 `render`，不叠加 `asChild`。自定义组件必须透传收到的属性和 ref。改为非 button 元素时指定 `nativeButton={false}`，保持按钮语义；导航链接直接使用链接语义。参见 [Base UI Button](https://base-ui.com/react/components/button)。 |
| ref               | 指向实际交互或视觉根节点，不指向内部布局元素。React 19 直接接收并传递 ref，无须额外使用 `forwardRef`。Button 为 `HTMLElement`（允许 render 改根节点），Spinner 为 `SVGSVGElement`。                                                             |
| className / style | 保留 Primitive 支持的类型；Button 的函数式 className 先求值，再通过 cn 合并默认类和调用方类名，style 原样传递。                                                                                                                                 |
| 公共无头层        | 当前不新增。Base UI 已处理事件、ref 和基础无障碍组合；只有出现多个组件共享的确定行为时才提取对应 hook 或工具，不增加通用 DOM 包裹层。                                                                                                           |
| 状态与无障碍      | 明确 disabled、loading、焦点和键盘的关系。Button 加载时设置 `aria-busy`、`data-loading`，禁用激活并默认保留焦点；显式 disabled 仍遵循普通禁用规则。纯图标按钮由应用提供 `aria-label`。                                                          |
| 事件与表单        | 普通 onClick 先执行，preventDefault 可取消异步动作。普通按钮默认 type="button"；表单提交由应用的 onSubmit 负责。组件不发起业务请求、不导航、不显示固定 Toast。                                                                                  |

公共输入的重点是统一契约，而非强行统一组件结构。受控 / 非受控值、变体、尺寸或插槽在具体组件出现实际需求时增加，不先构建一套泛型组件工厂。

## 内部工具与类名合并

组件、内部工具和内部 Hook 分别维护在 `src/components/`、`src/_utils/` 和 `src/_hooks/`。空的 `_hooks` 目录仅保留占位文件，不预先创建没有实际用途的 Hook。

`cn` 使用 `twMerge(clsx(inputs))`：clsx 处理数组、对象和空值，tailwind-merge 消除冲突的 Tailwind 工具类，让后传入的调用方类名覆盖默认类。例如：

```tsx
import { cn } from "../../_utils/cn.js";

<span className={cn("inline-flex gap-2", { "opacity-0": busy }, className)} />;
```

类名处理约定以 [AGENTS.md](AGENTS.md#类名处理) 为入口。ESLint 在 JSX 属性、类名变量、属性赋值、回调及 cn 参数中检查手工拼接、三元和短路表达式；固定字符串和已有变量可直接传递。内部目录的下划线前缀也已接入命名检查。`pnpm check` 包含这些检查及对应回归测试。

## Button 与 Spinner

```tsx
<Button
  onAsyncClick={async () => {
    await saveChanges();
  }}
  onAsyncError={(error) => {
    showSaveError(error);
  }}
>
  保存更改
</Button>

<Button type="submit" loading={isSubmitting}>
  提交表单
</Button>

<Spinner size={24} className="text-teal-700" aria-label="正在同步" />
```

`onAsyncClick` 返回 Promise，`onAsyncError` 在类型上与它配套必填，接收原始错误（包括回调同步抛出的异常）。加载状态在 `finally` 中恢复；错误展示与恢复策略由应用决定。不要把错误处理留空。普通 `onClick` 保持同步事件契约，需要自动加载时改用 `onAsyncClick`。

`loading` 与内部 pending 采用逻辑或；外部传 false 不会提前结束尚未完成的异步动作。执行期间屏蔽鼠标、键盘及程序触发的重复激活，文案保持在可访问树中，Spinner 居中覆盖，避免按钮宽度跳动。组件只跟踪返回的 Promise，不自动取消请求、不加超时或重试；回调应返回完整的任务链。

`onAsyncClick` 会阻止点击的默认行为，包含 type="submit" 的原生提交。需要 HTML 表单校验、Enter 提交和表单级状态时，使用 `<form onSubmit={...}>` + `<Button type="submit" loading={...}>`，不要同时用 onAsyncClick 发起另一条提交链。onClick 的异常仍由调用方负责；它不属于异步回调的错误处理范围。

Spinner 使用 Lucide 的具名 `LoaderCircle` 导入，无动态图标注册或额外 Icon 包装。默认尺寸为 16，提供 `role="status"` 和“加载中”名称；若已有相邻状态文案，传 `aria-hidden="true"` 避免重复朗读。尺寸、颜色、描边和 SVG 属性直接遵循 Lucide，减少动态效果偏好下停止旋转。参见 [Lucide React](https://lucide.dev/guide/react/)。

Button 与 Spinner 独立分发，安装后同处 `src/components/ui`，Button 使用 `./Spinner.js` 引用依赖。两者均通过 `requires` 依赖 `ui/utils`，将内部工具安装到 `src/_utils`；`../../_utils/cn.js` 在仓库和消费项目中都成立，不复制多份工具。内部标记表示它不是公开组件入口，不代表消费项目不需要这份实现。仓库中通过 TypeScript `rootDirs` 和 Storybook Vite alias 对齐组件的安装布局，不向消费项目分发这些开发配置。

## 清单与分发索引

`catalog.json` 是编辑入口，`registry/index.json` 是 `pnpm build` 生成的下载目录。[shadcn 的 registry.json](https://ui.shadcn.com/docs/registry/registry-json) 也描述组件、文件和依赖，但这里遵循 lt 的 v2 协议，不能直接交给 shadcn CLI。

| 字段                      | 用途                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `type`、`name`、`version` | 标识具体资产版本                                                                    |
| `description`             | 给人看的用途简介，显示在 `lt list` 和交互安装菜单中；不控制渲染、安装路径或组件行为 |
| `directory`               | 仅在 catalog 中，指向待分发源码目录                                                 |
| `targetDirectory`         | 仅在 catalog 中，声明消费项目的安装目录，构建时作为快照文件路径的前缀               |
| `dependencies`            | 仅在 catalog 和快照中，声明消费项目需要的 npm 依赖                                  |
| `requires`                | 依赖的其他资产及精确版本，供 lt 解析安装计划                                        |
| `url`、`sha256`           | 仅在索引中，定位并校验源码快照                                                      |

`description` 会同步写入快照，因此修改它也属于资产内容变化，需要提升版本。Storybook 的长说明和具体场景放在 story 中，不从这句简介推导文档。

修改分发源码、描述或依赖后，先提升 catalog 中对应资产的版本，再运行 `pnpm build` 和 `pnpm check`。构建拒绝覆盖同名同版本的不同内容；正常构建保留历史版本。检查只读验证，不自动修复过期产物。分发文件与源码、锁文件一起提交。

彻底撤回资产时，需要同时清理 catalog 条目、源码目录、相关 story/文档、索引内所有版本和对应快照；仅从 catalog 删除不会撤回旧版本。撤回前检查消费模板的 `requires`，避免其精确版本依赖失效。已安装到其他项目的源码不会被远程删除。

## 在项目中安装

消费项目需先配置 React 19 和 Tailwind CSS 4，并安装所选资产声明的依赖。`lt add` 检查依赖声明并复制源码，不运行包管理器。Button 还需要 `@base-ui/react`，并通过 `requires` 安装 Spinner；Spinner 需要 `lucide-react`；两者依赖的 `ui/utils` 需要 `clsx` 和 `tailwind-merge`。

```bash
lt add ui button --cwd /path/to/app --source /path/to/luigi-ui/registry/index.json
```

`--source` 可直接指向本仓库的本地索引。公开下载地址需等分发文件推送后才生效；本地构建不等于已经发布。跨仓依赖通过组合来源配置解析，见 [来源协议](https://github.com/shaojie-li/luigi-tools/blob/main/docs/cli.md)。本仓库的 Storybook、Vite 等开发依赖不复制到消费项目。

MIT License。
