import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "reflecube",
    compatibilityDate: "2026-11-10",
    domains: ["reflecube.fle.st"],
    workersDev: false,
    previewUrls: false,
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
