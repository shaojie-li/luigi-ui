# luigi-ui

普通 ESM React 组件库，提供 Button、Spinner 和语义颜色主题。业务请求、路由、通知和持久化由消费项目负责；基础交互复用 Base UI。

## 使用

```tsx
// 在应用全局入口引入一次。JS 导入不会隐式加载样式。
import "luigi-ui/styles.css";
import { Button, Spinner } from "luigi-ui";

export function SaveButton() {
  return <Button>保存更改</Button>;
}
```

消费项目需要 React 19 / React DOM 19，不需要安装 Tailwind、配置源码扫描或复制组件文件。其他运行时依赖由包管理器安装。CSS 是提前编译的独立文件，应在应用自定义覆盖样式之前导入。

当前包尚未发布，保留 private 防止误发布。可先在本库运行 `corepack pnpm pack --pack-destination /tmp`，再在消费项目执行 `pnpm add /tmp/luigi-ui-0.2.0.tgz`，随后按上面的包名导入；也可使用工作区依赖。打包不等于发布。

ESM 和 `sideEffects: ["**/*.css"]` 支持消费端删除未使用的 JS，同时保留显式导入的 CSS。只使用 Spinner 时不应带入 Button 或 Base UI；Button 使用的 Spinner 是必要依赖。整份 CSS 不会随着 JS 自动按组件裁剪，目前统一导入即可。

组件样式位于 `components` 层，Tailwind 工具类使用 `lui:` 前缀；不注入全局 Preflight。普通未分层业务 CSS、内联 style 或更后面的 utilities 层可覆盖默认样式。`className` 使用 cn 合并，业务方新增的 Tailwind 工具类仍需要由业务方自己的构建生成，库不会预编译任意类名。

## 颜色系统

颜色不依赖、不导入 Tailwind 默认色板。Tailwind 4.3.3 仅在本库构建时扫描组件内的工具类，并将 `@theme inline` 映射编译成普通 CSS；非颜色尺度也由本库按需维护。

命名格式为 `--ui-<语义>-<用途>[-<状态>]`：

| 维度     | 值                                                             | 含义                                             |
| -------- | -------------------------------------------------------------- | ------------------------------------------------ |
| 语义     | primary / neutral / success / danger / warning / info / accent | 主操作、中性、成功、失败或危险、警告、信息、强调 |
| 用途     | solid                                                          | 实色背景                                         |
| 用途     | on-solid                                                       | 实色背景上的文字和图标，与 solid 配对            |
| 用途     | subtle                                                         | 弱化背景                                         |
| 用途     | text                                                           | 画布或弱化背景上的文字、图标                     |
| 用途     | border                                                         | 边框                                             |
| 用途     | decoration                                                     | 下划线等文本装饰颜色                             |
| 状态     | 无后缀 / hover / active / focus / selected / disabled          | 默认、悬停、按下、聚焦、选中、禁用               |
| 焦点指示 | `<语义>-focus-ring`                                            | 独立焦点环，不能仅靠背景变色表示键盘焦点         |

另有 canvas、surface、surface-raised、fg、fg-muted、fg-disabled、border、border-disabled、bg-disabled、overlay 通用变量。7 个语义都提供相同用途和状态，允许某些状态暂时共享色值，但变量可以独立覆盖。disabled 是不可操作语义，loading 是否可聚焦仍由组件行为控制。

例如失败提示和带下划线的交互：

```css
.failure-message {
  background: var(--ui-danger-subtle);
  color: var(--ui-danger-text);
  border: 1px solid var(--ui-danger-border);
}

.details-link {
  color: var(--ui-info-text);
  text-decoration: underline;
  text-decoration-color: var(--ui-info-decoration);
}

.details-link:hover {
  color: var(--ui-info-text-hover);
  text-decoration-color: var(--ui-info-decoration-hover);
}

.details-link:focus-visible {
  outline: 2px solid var(--ui-info-focus-ring);
  outline-offset: 2px;
}
```

颜色变量只提供设计值，不会自动赋予元素 hover、focus、disabled 行为；实际状态选择器、禁用逻辑和无障碍属性由组件负责。不要将 on-solid 用作浅色画布上的正文颜色，或把弱化背景直接当作文字颜色。

### 唯一编辑入口与生成流程

`src/styles/colors.json` 是颜色数据的唯一来源，不手改 `tokens.css` 和 `theme.css`。修改 JSON 后运行：

```bash
corepack pnpm colors:generate
```

| JSON 字段 | 职责                                                                    |
| --------- | ----------------------------------------------------------------------- |
| version   | 数据格式版本，目前为 1                                                  |
| tones     | 语义集合；新增语义后，具体组件按需增加对应 API 和样式                   |
| modes     | light / dark 的完整基础色，包含画布、文字、基础语义色板                 |
| themes    | 各主题在 light / dark 下对基础色的覆盖，未覆盖项使用对应 mode 的值      |
| shared    | 通用禁用背景、文字和边框的派生规则                                      |
| semantic  | 每种语义的用途与状态规则；`{tone}` 编译时展开为 primary、success 等名称 |

颜色值目前支持六位或八位 HEX、`var(--ui-...)` 引用，以及 `color-mix(in srgb, var(--ui-...) 88%, var(--ui-...))`。格式有意保持有限，脚本会拒绝未知引用、循环引用、非法值、无效主题名和拼错的覆盖键。管理后台以后可以读写同一 JSON；当前没有引入后台、接口或通用配置框架。

例如 `semantic.solid-hover` 的 88% 表示混合 88% 的实色与 12% 的 `state-mix`。浅色模式的 state-mix 较深，深色模式较浅，因此同一规则能生成两种模式的交互反馈。当前各语义共享状态推导规则，主题覆盖基础色；独立变量也允许消费项目在自身样式中覆盖。库内调整仍通过 JSON 完成，不手改生成文件。

`pnpm colors:check` 重新计算期望内容并逐字核对两个生成文件；已接入 check、组件包构建和 Storybook 启动/构建。忘记生成或手改生成文件都会失败。源 JSON 和两个生成 CSS 一起提交；最终 dist 仍不提交。

### tokens.css 与 theme.css 分别做什么

以成功按钮为例，这条链路没有组件专用颜色别名：

```text
colors.json 中 palette-success 的具体色值
  → tokens.css 中 --ui-palette-success
  → tokens.css 中 --ui-success-solid / --ui-success-solid-hover 等语义变量
  → theme.css 中 --color-ui-success-solid 映射
  → Button.tsx 中 lui:bg-ui-success-solid 等工具类
```

`tokens.css` 提供浏览器运行时变量与主题选择器；它原来篇幅很大，是因为 7 种语义 × 6 种用途 × 6 种状态展开成了独立变量，现在全部由脚本生成。变量在每个主题边界重新声明，是为了让局部主题按自己的基础色求值，而不是继承父级已经计算好的颜色。

`theme.css` 是 Tailwind v4 的编译映射。`@theme inline` 把工具类直接编译为 `background-color: var(--ui-success-solid)`，运行时仍读取当前主题。它本身不决定哪个组件何时使用这种颜色。

组件的布局、边框、动画使用方式、tone、variant、hover / active / focus / disabled 等规则均与组件源码共置。Button 用 `tailwind-variants/lite` 组织组合，再交给现有 cn 做冲突合并；不重复引入另一份类名合并引擎。全局 CSS 只维护生成颜色、必要的尺度和共享关键帧、构建入口，没有 button.css 或 components.css。

库内工具类使用 `lui:` 前缀，避免与消费项目的 Tailwind 类冲突，并编译到 components 层。库内 cn 同时处理普通类和带前缀类；调用方可以使用自身生成的普通工具类覆盖样式。Storybook 使用库内前缀展示覆盖，例如 `lui:px-8`，不代表发布 CSS 包含任意前缀工具类。

### 主题与明暗

```html
<html data-ui-theme="ocean" data-ui-mode="dark"></html>
```

内置 default、ocean 两个主题及 light、dark 两个模式，默认是 default / light。主题与模式放在同一元素；局部主题也提供完整组合。增加内置主题只需在 `colors.json` 的 `themes` 下添加名称和 light / dark 覆盖，然后重新生成。每个主题边界重置基础色并重新计算派生变量，因此内层 default 不会意外继承外层 ocean 的配色。

应用负责主题选择、系统偏好、保存和首屏初始化。建议根元素设置全局主题，挂到 body 的浮层可以自然继承；局部主题使用 Portal 时，应把挂载点放入同一边界或同步完整主题组合。库不内置 ThemeProvider、不读取 localStorage。

### 可选 Tailwind v4 工具类

普通消费项目无需此步骤。如果业务项目也使用 Tailwind v4，可额外在它的 Tailwind CSS 入口导入映射：

```css
/* 业务方自身的 Tailwind 入口之后导入；组件仍需 styles.css。 */
@import "luigi-ui/theme.css";
```

随后使用 `bg-ui-success-subtle`、`text-ui-success-text`、`hover:border-ui-success-border-hover`、`focus-visible:decoration-ui-info-decoration-focus` 等标准工具类。每个语义变量映射到 `--color-ui-*`，同一变量可用于背景、文字、边框、装饰线、描边或填充；实际用途遵守上述语义约定。只生成业务代码使用的类，不在组件包中枚举所有状态与 CSS 属性的笛卡尔积。

`theme.css` 含构建指令，不是单独可用的运行时样式。它不会清空业务方自己的颜色系统；组件库自身的构建从未导入默认色板。

## 开发与构建

使用 Node.js 22.13+ 和 packageManager 指定的 pnpm。

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm storybook
corepack pnpm check
corepack pnpm build-storybook
```

`pnpm check` 首先核对生成 CSS 与颜色 JSON 一致，再执行规范、格式、类型、组件包构建和测试；`pnpm build` 生成 ESM、类型声明、styles.css 和可选 theme.css。发布包仅包含 dist、README、LICENSE 和包元数据，dist 不提交。构建保留每个模块及 Button 的 use client 指令。

Storybook 直接使用组件和样式源码，工具栏可切换主题和明暗。Colors 展示 7 种语义、6 种状态及各用途；组件 Story 包含交互断言。静态 Storybook 构建不执行 play，关键交互仍需在浏览器验证。

```text
src/index.ts                 # 公共组件及类型入口
src/components/              # 组件实现
src/_utils/                  # 内部工具
src/styles/                  # 颜色 JSON、生成变量、Tailwind 构建入口
stories/                     # 开发示例，不进入发布包
scripts/build.ts             # ESM、类型和 CSS 构建
scripts/package.test.ts      # 实际安装包的消费验证
```

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

## Button 与 Spinner

Button 的语义颜色与外观独立配置，默认 `tone="primary"`、`variant="solid"`：

```tsx
<Button tone="success" variant="solid">保存</Button>
<Button tone="danger" variant="outline">删除</Button>
<Button tone="warning" variant="soft">检查风险</Button>
<Button tone="info" variant="text">查看详情</Button>
```

`tone` 支持 primary、neutral、success、danger、warning、info、accent；公开类型为 `ButtonTone`、`ButtonVariant`、`ButtonProps`。这两个属性不会作为原生属性泄漏到 DOM，组件内的 `tailwind-variants` 根据这两个属性选择工具类；`data-tone` 和 `data-variant` 用于观察当前配置。

| variant | 默认外观                         | 交互反馈                                         |
| ------- | -------------------------------- | ------------------------------------------------ |
| solid   | 实色背景及配对前景               | hover / active 调整实色背景、前景和边框          |
| outline | 透明背景、语义边框与文字         | hover / active / focus 使用弱化背景              |
| soft    | 弱化背景、语义文字，透明边框占位 | 使用对应状态的弱化背景和文字                     |
| text    | 透明背景与边框、语义文字         | hover / active / focus / selected 显示语义下划线 |

所有变体保留相同内边距和 1px 边框占位；loading 保留文案宽度并居中显示 Spinner。禁用和加载屏蔽 hover / active 反馈，使用对应禁用色；四种变体仍保留各自的背景与边框结构。键盘焦点环独立于填色，悬停或按下不会移除它。

业务需要切换按钮时，用受控 `aria-pressed` 表达选中：`<Button aria-pressed={selected} onClick={toggle}>置顶</Button>`。组件使用 selected 颜色，但不自行管理切换状态；普通操作按钮无需传此属性。聚焦已选中按钮时保留选中颜色，仍显示焦点环。

Storybook 的 All Tones And Variants 展示 28 种组合；Interaction States 展示默认、hover、active、focus、focus-hover、selected、disabled、loading，可用 Controls 切换 tone，并用工具栏切换主题和明暗。伪状态插件只用于开发预览，真实状态规则来自组件内的 Tailwind 变体；Keyboard Toggle 和异步场景验证实际键盘、选中、加载与焦点行为。

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

<Spinner size={24} style={{ color: "var(--ui-info-text)" }} aria-label="正在同步" />
```

`onAsyncClick` 返回 Promise，`onAsyncError` 在类型上与它配套必填，接收原始错误（包括回调同步抛出的异常）。加载状态在 `finally` 中恢复；错误展示与恢复策略由应用决定。不要把错误处理留空。普通 `onClick` 保持同步事件契约，需要自动加载时改用 `onAsyncClick`。

`loading` 与内部 pending 采用逻辑或；外部传 false 不会提前结束尚未完成的异步动作。执行期间屏蔽鼠标、键盘及程序触发的重复激活，文案保持在可访问树中，Spinner 居中覆盖，避免按钮宽度跳动。组件只跟踪返回的 Promise，不自动取消请求、不加超时或重试；回调应返回完整的任务链。

`onAsyncClick` 会阻止点击的默认行为，包含 type="submit" 的原生提交。需要 HTML 表单校验、Enter 提交和表单级状态时，使用 `<form onSubmit={...}>` + `<Button type="submit" loading={...}>`，不要同时用 onAsyncClick 发起另一条提交链。onClick 的异常仍由调用方负责；它不属于异步回调的错误处理范围。

Spinner 使用 Lucide 的具名 `LoaderCircle` 导入，无动态图标注册或额外 Icon 包装。默认尺寸为 16，提供 `role="status"` 和“加载中”名称；若已有相邻状态文案，传 `aria-hidden="true"` 避免重复朗读。尺寸、颜色、描边和 SVG 属性直接遵循 Lucide，减少动态效果偏好下停止旋转。参见 [Lucide React](https://lucide.dev/guide/react/)。

MIT License。
