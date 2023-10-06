import fs from "fs";
import { globSync } from "glob";
import path from "path";
import * as url from "url";
import { WARNING_FILE_HEADER } from "./const.ts";

function generatIndexFile() {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const outputPath = path.resolve(__dirname, "../../style");
  const themeFolderPath = `${outputPath}/theme`;
  const componentsFolderPath = `${outputPath}/components`;
  const theme = globSync(`${themeFolderPath}/*.less`);
  const components = globSync(`${componentsFolderPath}/*.less`);

  // write theme index.less
  const themeIndexPath = `${themeFolderPath}/index.less`;
  fs.writeFileSync(
    themeIndexPath,
    `
  /**
   *
   ${WARNING_FILE_HEADER}
   */\n\n\n
  `
  );
  theme.forEach((t) => {
    fs.appendFileSync(themeIndexPath, `@import "${t}";\n`);
  });

  // write components index.less
  const componentsIndexPath = `${componentsFolderPath}/index.less`;
  fs.writeFileSync(
    componentsIndexPath,
    `
  /**
   *
   ${WARNING_FILE_HEADER}
   */\n\n\n
  `
  );
  components.forEach((c) => {
    fs.appendFileSync(componentsIndexPath, `@import "${c}";\n`);
  });
}

export { generatIndexFile };
