import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rendererDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(rendererDirectory, "../..");

export default defineConfig({
  root: rendererDirectory,
  plugins: [react()],
  resolve: {
    alias: {
      "@": repositoryRoot,
    },
  },
  define: {
    __REPOSITORY_ROOT__: JSON.stringify(repositoryRoot),
  },
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
