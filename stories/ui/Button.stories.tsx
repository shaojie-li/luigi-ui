import { createRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { cn } from "../../src/_utils/cn.js";
import {
  Button,
  type ButtonTone,
  type ButtonVariant,
} from "../../src/components/button/Button.js";

const tones: ButtonTone[] = [
  "primary",
  "neutral",
  "success",
  "danger",
  "warning",
  "info",
  "accent",
];
const variants: ButtonVariant[] = ["solid", "outline", "soft", "text"];

const meta = {
  title: "基础组件/Button",
  component: Button,
  args: {
    children: "保存更改",
    onClick: fn(),
    tone: "primary",
    variant: "solid",
  },
  argTypes: {
    children: { control: "text" },
    tone: { control: "select", options: tones },
    variant: { control: "select", options: variants },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    onAsyncClick: {
      control: false,
      description:
        "返回 Promise 的点击动作；内部维护 loading，并阻止默认表单提交。",
      table: { type: { summary: "(event) => Promise<unknown>" } },
    },
    onAsyncError: {
      control: false,
      description: "使用 onAsyncClick 时必填；接收原始异常，由应用展示错误。",
      table: { type: { summary: "(error: unknown) => void" } },
    },
    render: {
      control: false,
      description: "Base UI 组合渲染接口；自定义组件需透传属性与 ref。",
    },
    ref: { control: false, description: "实际交互根节点的 HTMLElement ref。" },
    className: {
      control: false,
      description: "字符串或状态函数；结果与默认类合并。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "透传原生属性、事件、ref 和 Base UI render。loading 支持外部状态；onAsyncClick 自动维护加载状态，须配合 onAsyncError 处理错误。普通 onClick 可通过 preventDefault 取消异步动作。异步动作阻止默认表单提交，表单异步提交请使用 onSubmit + loading。",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toHaveStyle({ cursor: "pointer" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    canvasElement.dataset.playResult = "passed";
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: "不可操作" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await expect(button).toHaveStyle({ cursor: "not-allowed" });
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    canvasElement.dataset.playResult = "passed";
  },
};

export const LongLabel: Story = {
  args: { children: "保存更改并返回项目设置" },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "保存更改",
    });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveStyle({ cursor: "not-allowed" });
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    canvasElement.dataset.playResult = "passed";
  },
};

export const AsyncSuccess: Story = {
  args: {
    tone: "success",
    variant: "soft",
    onAsyncClick: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }),
    onAsyncError: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    const width = button.getBoundingClientRect().width;
    button.focus();
    // 同一轮事件连续触发，验证渲染前的防重入锁。
    button.click();
    button.click();
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"));
    await expect(button).toHaveStyle({ cursor: "not-allowed" });
    await expect(button).toHaveAccessibleName("保存更改");
    await expect(button).toHaveFocus();
    await expect(button.getBoundingClientRect().width).toBe(width);
    await userEvent.keyboard("{Enter} ");
    await expect(args.onAsyncClick).toHaveBeenCalledTimes(1);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "false"));
    await expect(button).toBeEnabled();
    await expect(button).toHaveStyle({ cursor: "pointer" });
    await expect(args.onAsyncError).not.toHaveBeenCalled();
    await userEvent.click(button);
    await expect(args.onAsyncClick).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "false"));
    canvasElement.dataset.playResult = "passed";
  },
};

const saveError = new Error("示例：保存失败，请重试");

export const AsyncError: Story = {
  args: {
    onAsyncClick: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw saveError;
    }),
    onAsyncError: fn(),
  },
  render: function ErrorExample(args) {
    const [message, setMessage] = useState("");
    return (
      <div className="space-y-3">
        <Button
          {...args}
          onAsyncClick={args.onAsyncClick!}
          onAsyncError={(error) => {
            args.onAsyncError?.(error);
            setMessage(error instanceof Error ? error.message : "操作失败");
          }}
        />
        {message && <p role="alert">{message}</p>}
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      saveError.message,
    );
    await expect(args.onAsyncError).toHaveBeenCalledWith(saveError);
    await expect(button).toHaveAttribute("aria-busy", "false");
    await userEvent.click(button);
    await waitFor(() => expect(args.onAsyncError).toHaveBeenCalledTimes(2));
    canvasElement.dataset.playResult = "passed";
  },
};

export const CancelAsync: Story = {
  args: {
    onClick: fn((event) => event.preventDefault()),
    onAsyncClick: fn(async () => {}),
    onAsyncError: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onAsyncClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute("aria-busy", "false");
    canvasElement.dataset.playResult = "passed";
  },
};

const rootRef = createRef<HTMLElement>();

export const RenderAndRef: Story = {
  args: {
    render: <button data-composed="true" />,
    ref: rootRef,
    className: (state) =>
      cn("lui:bg-ui-success-solid lui:px-8", {
        "custom-disabled": state.disabled,
        "custom-enabled": !state.disabled,
      }),
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(rootRef.current).toBe(button);
    await expect(button).toHaveAttribute("data-composed", "true");
    await expect(button).toHaveClass("custom-enabled");
    await expect(button).toHaveClass("lui-button");
    await expect(button).toHaveClass("lui:bg-ui-success-solid", "lui:px-8");
    await expect(button).toHaveStyle({ paddingLeft: "32px" });
    canvasElement.dataset.playResult = "passed";
  },
};

export const FormSubmit: Story = {
  render: function FormExample(args) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setSaved(true);
          }, 300);
        }}
      >
        <Button {...args} type="submit" loading={loading} />
        {saved && <p role="status">已保存</p>}
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(await canvas.findByRole("status")).toHaveTextContent("已保存");
    canvasElement.dataset.playResult = "passed";
  },
};

export const SynchronousAsyncError: Story = {
  args: {
    onAsyncClick: fn((): Promise<void> => {
      throw saveError;
    }),
    onAsyncError: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button);
    await expect(args.onAsyncError).toHaveBeenCalledWith(saveError);
    await expect(button).toHaveAttribute("aria-busy", "false");
    await expect(button).toBeEnabled();
    canvasElement.dataset.playResult = "passed";
  },
};

const submit = fn((event: React.FormEvent) => event.preventDefault());

export const AsyncPreventsSubmit: Story = {
  args: {
    type: "submit",
    onAsyncClick: fn(async () => {}),
    onAsyncError: fn(),
  },
  render: (args) => (
    <form onSubmit={submit}>
      <Button {...args} />
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onAsyncClick).toHaveBeenCalledTimes(1);
    await expect(submit).not.toHaveBeenCalled();
    canvasElement.dataset.playResult = "passed";
  },
};

export const AllTonesAndVariants: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="button-matrix">
      <table>
        <caption>7 种语义色 × 4 种外观，可直接悬停、按下和键盘操作。</caption>
        <thead>
          <tr>
            <th>语义颜色</th>
            {variants.map((variant) => (
              <th key={variant}>{variant}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tones.map((tone) => (
            <tr key={tone}>
              <th>{tone}</th>
              {variants.map((variant) => (
                <td key={variant}>
                  <Button {...args} tone={tone} variant={variant} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(28);
    for (const button of buttons) {
      await expect(button).not.toHaveAttribute("tone");
      await expect(button).not.toHaveAttribute("variant");
      await expect(button).toHaveStyle({
        borderWidth: "1px",
        cursor: "pointer",
      });
    }
    canvasElement.dataset.playResult = "passed";
  },
};

const previewStates = [
  "default",
  "hover",
  "active",
  "focus",
  "focus-hover",
  "selected",
  "disabled",
  "loading",
] as const;
type PreviewState = (typeof previewStates)[number];

// 独立表达设计契约作为颜色参照，检查状态选择器是否真的生效。
function stateColors(
  tone: ButtonTone,
  variant: ButtonVariant,
  state: PreviewState,
) {
  let suffix = `-${state}`;
  if (state === "default") suffix = "";
  if (state === "focus-hover") suffix = "-hover";
  if (state === "loading") suffix = "-disabled";
  let background = `var(--ui-${tone}-subtle${suffix})`;
  let foreground = `var(--ui-${tone}-text${suffix})`;
  let border = "transparent";
  let decoration = `var(--ui-${tone}-decoration${suffix})`;
  if (variant === "solid") {
    background = `var(--ui-${tone}-solid${suffix})`;
    foreground = `var(--ui-${tone}-on-solid${suffix})`;
    decoration = foreground;
  }
  if (variant === "solid" || variant === "outline")
    border = `var(--ui-${tone}-border${suffix})`;
  if (
    variant === "text" ||
    (variant === "outline" &&
      ["default", "disabled", "loading"].includes(state))
  )
    background = "transparent";
  return {
    backgroundColor: background,
    color: foreground,
    borderColor: border,
    textDecorationColor: decoration,
    outlineColor: `var(--ui-${tone}-focus-ring)`,
  };
}

export const InteractionStates: Story = {
  parameters: {
    layout: "fullscreen",
    pseudo: {
      hover: [
        '[data-preview-state="hover"]',
        '[data-preview-state="active"]',
        '[data-preview-state="focus-hover"]',
        '[data-preview-state="disabled"]',
        '[data-preview-state="loading"]',
      ],
      active: '[data-preview-state="active"]',
      focusVisible: [
        '[data-preview-state="focus"]',
        '[data-preview-state="focus-hover"]',
        '[data-preview-state="loading"]',
      ],
    },
  },
  render: (args) => (
    <div className="button-matrix button-state-grid">
      <table>
        <caption>
          通过 Controls 切换 tone；hover / active / focus 为 CSS
          伪状态预览，disabled / loading 使用真实组件属性。focus-hover
          验证悬停时保留焦点环。
        </caption>
        <thead>
          <tr>
            <th>外观</th>
            {previewStates.map((state) => (
              <th key={state}>{state}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant}>
              <th>{variant}</th>
              {previewStates.map((state) => (
                <td key={state}>
                  <Button
                    {...args}
                    variant={variant}
                    data-preview-state={state}
                    disabled={state === "disabled"}
                    loading={state === "loading"}
                    aria-pressed={state === "selected" ? true : undefined}
                  />
                  <span
                    hidden
                    data-color-reference
                    style={stateColors(args.tone ?? "primary", variant, state)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(32);
    for (const button of buttons.filter((element) =>
      element.hasAttribute("data-disabled"),
    )) {
      await userEvent.click(button);
      await expect(button).toHaveStyle({ cursor: "not-allowed" });
      if (button.dataset.previewState === "disabled")
        await expect(button).toBeDisabled();
      if (button.dataset.previewState === "loading") {
        await expect(button).toHaveAttribute("aria-busy", "true");
        await expect(button).toHaveAttribute("aria-disabled", "true");
        const label = button.querySelector(".lui-button-label");
        await expect(label).toHaveStyle({ opacity: "0" });
        await expect(button.querySelector(".lui-spinner")).not.toBeNull();
      }
    }
    await expect(args.onClick).not.toHaveBeenCalled();
  },
  // 伪状态插件在 STORY_RENDERED 后改写样式，颜色断言需在 afterEach 执行。
  afterEach: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await waitFor(async () => {
      for (const button of buttons) {
        const reference = button.parentElement?.querySelector(
          "[data-color-reference]",
        );
        if (!reference) throw new Error("缺少状态颜色参照");
        const actual = getComputedStyle(button);
        const expected = getComputedStyle(reference);
        for (const property of [
          "backgroundColor",
          "color",
          "borderTopColor",
          "textDecorationColor",
        ] as const) {
          await expect(
            actual[property],
            `${button.dataset.variant}/${button.dataset.previewState}/${property}`,
          ).toBe(expected[property]);
        }
        const state = button.dataset.previewState;
        if (
          state === "focus" ||
          state === "focus-hover" ||
          state === "loading"
        ) {
          await expect(actual.outlineStyle).toBe("solid");
          await expect(actual.outlineWidth).toBe("2px");
          await expect(actual.outlineColor).toBe(expected.outlineColor);
        }
        if (button.dataset.variant === "text") {
          const underlined = [
            "hover",
            "active",
            "focus",
            "focus-hover",
            "selected",
          ].includes(state ?? "");
          await expect(actual.textDecorationLine).toBe(
            underlined ? "underline" : "none",
          );
        }
      }
    });
    canvasElement.dataset.playResult = "passed";
  },
};

export const KeyboardToggle: Story = {
  args: { tone: "accent", variant: "outline", children: "置顶" },
  render: function ToggleExample(args) {
    const [pressed, setPressed] = useState(false);
    return (
      <Button
        {...args}
        aria-pressed={pressed}
        onClick={(event) => {
          args.onClick?.(event);
          setPressed(!pressed);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "置顶" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveStyle({
      outlineStyle: "solid",
      outlineWidth: "2px",
    });
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    canvasElement.dataset.playResult = "passed";
  },
};
