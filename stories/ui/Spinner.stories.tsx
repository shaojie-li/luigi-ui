import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Spinner } from "../../src/components/spinner/Spinner.js";

const meta = {
  title: "基础组件/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "使用 Lucide LoaderCircle。默认提供加载状态语义；旁边已有状态文案时传 aria-hidden。透传 SVG 属性和 ref，并遵循减少动态效果偏好。",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;
const rootRef = createRef<SVGSVGElement>();

export const Default: Story = {
  args: { ref: rootRef },
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole("status", {
      name: "加载中",
    });
    await expect(rootRef.current).toBe(spinner);
    await expect(spinner).toHaveClass("lui-spinner");
    await expect(spinner).toHaveStyle({ animationName: "lui-spin" });
    canvasElement.dataset.playResult = "passed";
  },
};

export const CustomSize: Story = {
  args: {
    size: 32,
    strokeWidth: 1.5,
    className: "lui:animate-none lui:text-ui-info-text",
    "aria-label": "正在同步",
  },
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole("status", {
      name: "正在同步",
    });
    await expect(spinner).toHaveAttribute("width", "32");
    await expect(spinner).toHaveClass(
      "lui:animate-none",
      "lui:text-ui-info-text",
    );
    await expect(spinner).toHaveStyle({ animationName: "none" });
    canvasElement.dataset.playResult = "passed";
  },
};

export const WithLabel: Story = {
  render: () => (
    <span role="status" className="lui:inline-flex lui:items-center lui:gap-2">
      <Spinner aria-hidden="true" />
      正在加载项目…
    </span>
  ),
};
