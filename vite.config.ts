import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react({ compiler: true }), cloudflare()],
  css: {
    transformer: "lightningcss",
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  fmt: {
    sortImports: {},
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    "*": "vp check --fix",
  },
  run: {
    tasks: {
      dev: {
        command: "vp dev",
        cache: false,
      },
      "cf:types": "cf workers types",
      check: {
        command: "vp check",
        dependsOn: ["cf:types"],
      },
      test: "vp test",
      build: {
        command: "vp build",
        cache: {
          input: [{ auto: true }, "!.cloudflare/**"],
        },
      },
      preview: {
        command: "vp preview",
        dependsOn: ["build"],
        cache: false,
      },
      deploy: {
        command: "cf deploy --prebuilt",
        dependsOn: ["build"],
        cache: false,
      },
    },
  },
});
