import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "storybook-addon-pseudo-states"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;
