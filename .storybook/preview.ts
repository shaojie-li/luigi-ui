import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import "./preview.css";

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "default", mode: "light" },
  globalTypes: {
    theme: {
      description: "颜色主题",
      toolbar: { icon: "paintbrush", items: ["default", "ocean"] },
    },
    mode: {
      description: "明暗模式",
      toolbar: { icon: "circlehollow", items: ["light", "dark"] },
    },
  },
  decorators: [
    (Story, { globals }) =>
      createElement(
        "div",
        {
          className: "preview-theme",
          "data-ui-theme": globals.theme,
          "data-ui-mode": globals.mode,
        },
        createElement(Story),
      ),
  ],
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
};

export default preview;
