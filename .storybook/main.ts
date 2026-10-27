import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: [
          {
            find: /^\.\/Spinner\.js$/,
            replacement: resolve(
              import.meta.dirname,
              "../src/components/spinner/Spinner.tsx",
            ),
          },
        ],
      },
      plugins: [tailwindcss()],
    });
  },
};

export default config;
