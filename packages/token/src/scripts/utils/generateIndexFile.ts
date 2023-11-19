import fs from "fs";
import { globSync } from "glob";
import path from "path";
import * as url from "url";
import { WARNING_FILE_HEADER } from "./const.ts";

function genContent(path: string, files: string[]) {
  fs.writeFileSync(
    path,
    `
  /**
   *
   ${WARNING_FILE_HEADER}
   */\n\n\n
  `,
  );
  files.forEach((f) => {
    const p = f.split("/").pop();
    fs.appendFileSync(path, `@import "./${p}";\n`);
  });
}

function generatIndexFile() {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const outputPath = path.resolve(__dirname, "../../style");
  const themeFolderPath = `${outputPath}/theme`;
  const componentsFolderPath = `${outputPath}/components`;
  const theme = globSync(`${themeFolderPath}/*.less`);
  const components = globSync(`${componentsFolderPath}/*.less`);

  // write theme index.less
  genContent(`${themeFolderPath}/index.less`, theme);

  // write components index.less
  genContent(`${componentsFolderPath}/index.less`, components);

  // write index.less
  fs.writeFileSync(
    `${outputPath}/index.less`,
    `
      @import "./components/index.less";
      @import "./theme/index.less";

      @prefix: ezreal;
      @ezreal-vars-prefix: ~"--@{prefix}";
  `,
  );
}

export { generatIndexFile };
