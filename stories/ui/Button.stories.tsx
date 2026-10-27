import { createRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { cn } from "../../src/_utils/cn.js";
import { Button } from "../../src/components/button/Button.js";

const meta = {
  title: "基础组件/Button",
  component: Button,
  args: {
    children: "保存更改",
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text" },
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
      cn("bg-teal-700 px-8", {
        "custom-disabled": state.disabled,
        "custom-enabled": !state.disabled,
      }),
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(rootRef.current).toBe(button);
    await expect(button).toHaveAttribute("data-composed", "true");
    await expect(button).toHaveClass("custom-enabled");
    await expect(button).toHaveClass("inline-flex");
    await expect(button).toHaveClass("bg-teal-700", "px-8");
    await expect(button).not.toHaveClass("bg-slate-950", "px-4");
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
