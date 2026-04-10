import { defineConfig } from "vite-plus";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@aiao/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
