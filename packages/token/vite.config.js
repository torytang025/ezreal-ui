import path from "path";
import { defineConfig } from "vite";

// TODO optimize output (only build css without js)
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/style/index.less"),
      formats: ["es"],
    },
  },
});
