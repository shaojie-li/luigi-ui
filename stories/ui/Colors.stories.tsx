import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const tones = [
  "primary",
  "neutral",
  "success",
  "danger",
  "warning",
  "info",
  "accent",
];
const states = ["default", "hover", "active", "focus", "selected", "disabled"];

function color(tone: string, slot: string, state: string) {
  const suffix = state === "default" ? "" : `-${state}`;
  return `var(--ui-${tone}-${slot}${suffix})`;
}

function luminance(value: string) {
  if (!value.startsWith("rgb(") && !value.startsWith("color(srgb ")) {
    throw new Error(`不支持的计算颜色：${value}`);
  }
  const channels = value
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`无法读取颜色通道：${value}`);
  }
  const linear = channels.map((channel) => {
    const normalized = value.startsWith("rgb(") ? channel / 255 : channel;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return linear.reduce(
    (sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!,
    0,
  );
}

function contrast(foreground: string, background: string) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function Colors() {
  return (
    <table className="color-table">
      <caption>
        语义状态 × 交互状态 × 颜色用途（工具栏可切换主题与明暗）
      </caption>
      <thead>
        <tr>
          <th>语义</th>
          <th>状态</th>
          <th>实色背景 / 前景</th>
          <th>弱化背景 / 文字 / 边框 / 下划线</th>
          <th>焦点环</th>
        </tr>
      </thead>
      <tbody>
        {tones.flatMap((tone) =>
          states.map((state) => (
            <tr key={`${tone}-${state}`}>
              <th>{tone}</th>
              <td>{state}</td>
              <td>
                <span
                  className="color-sample"
                  style={{
                    background: color(tone, "solid", state),
                    color: color(tone, "on-solid", state),
                    borderColor: color(tone, "border", state),
                    textDecoration: "none",
                  }}
                >
                  保存更改
                </span>
              </td>
              <td>
                <span
                  className="color-sample"
                  style={{
                    background: color(tone, "subtle", state),
                    color: color(tone, "text", state),
                    borderColor: color(tone, "border", state),
                    textDecorationColor: color(tone, "decoration", state),
                  }}
                >
                  查看详情
                </span>
              </td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    padding: 8,
                    outline: `2px solid var(--ui-${tone}-focus-ring)`,
                    outlineOffset: 2,
                  }}
                >
                  键盘焦点
                </span>
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

const meta = {
  title: "设计基础/Colors",
  component: Colors,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table");
    await expect(within(table).getAllByRole("row")).toHaveLength(43);
    for (const sample of table.querySelectorAll<HTMLElement>(".color-sample")) {
      const style = getComputedStyle(sample);
      await expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      const state = sample.closest("tr")?.children[1]?.textContent;
      if (state !== "disabled") {
        await expect(
          contrast(style.color, style.backgroundColor),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    const scope = table.closest<HTMLElement>(".preview-theme");
    if (!scope) throw new Error("颜色预览缺少主题边界");
    for (const ring of table.querySelectorAll<HTMLElement>(
      "td:last-child span",
    )) {
      await expect(
        contrast(
          getComputedStyle(ring).outlineColor,
          getComputedStyle(scope).backgroundColor,
        ),
      ).toBeGreaterThanOrEqual(3);
    }
    canvasElement.dataset.playResult = "passed";
  },
};
