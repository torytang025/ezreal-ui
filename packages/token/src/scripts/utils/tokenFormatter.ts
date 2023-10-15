import StyleDictionary, { type Formatter } from "style-dictionary";
import { formattedVariables } from "./formattedVariables.ts";

const { fileHeader } = StyleDictionary.formatHelpers;

const sysColorFormatter: Formatter = ({ dictionary, options = {}, file }) => {
  const selector = options.selector ? options.selector : `:root`;
  const { outputReferences, formatting, fileImport } = options;
  const header = fileHeader({ file });
  const lightCssVariables = formattedVariables({
    format: "css",
    dictionary,
    outputReferences,
    formatting,
    filterOutput: (token) =>
      token.trim().startsWith("--ezreal-sys-color-light") ||
      token.trim().startsWith("--ezreal-sys-color-white") ||
      token.trim().startsWith("--ezreal-sys-color-black"),
  }).replace(/\-light/g, "");
  const darkCssVariables = formattedVariables({
    format: "css",
    dictionary,
    outputReferences,
    formatting,
    filterOutput: (token) => token.trim().startsWith("--ezreal-sys-color-dark"),
  }).replace(/\-dark/g, "");
  return `${header}${
    fileImport ?? ""
  }\n\n${selector} {\n${lightCssVariables}\n}\n\n${selector}[ezreal-theme="dark"] {\n${darkCssVariables}\n}\n`;
};

const componentFormatter: Formatter = ({ dictionary, options = {}, file }) => {
  const selector = options.selector ? options.selector : `:root`;
  const { outputReferences, formatting, filterOutput, fileImport } = options;
  const header = fileHeader({ file });
  const cssVariables = formattedVariables({
    format: "css",
    dictionary,
    outputReferences,
    formatting,
    filterOutput,
  })
    .replace(/\-light/g, "")
    .replace(/\-dark/g, "");
  return `${header}${fileImport ?? ""}\n\n${selector} {\n${cssVariables}\n}\n`;
};

export { componentFormatter, sysColorFormatter };
