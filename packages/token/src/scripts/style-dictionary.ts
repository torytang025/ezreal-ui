import { paramCase } from "change-case";
import { globSync } from "glob";
import path from "path";
import StyleDictionary, { Config } from "style-dictionary";
import tinycolor from "tinycolor2";
import * as url from "url";
import { WARNING_FILE_HEADER } from "./utils/const.ts";
import { formattedVariables } from "./utils/formattedVariables.ts";
import { generatIndexFile } from "./utils/generateIndexFile.ts";
import {
  componentFormatter,
  sysColorFormatter,
} from "./utils/tokenFormatter.ts";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const outputPath = path.resolve(__dirname, "../style");
const tokenPath = path.resolve(__dirname, "../tokens");
const componentTokenFiles = globSync(`${tokenPath}/components/*.json`);
const coreTokenFiles = globSync(`${tokenPath}/core/*.json`);

const { fileHeader } = StyleDictionary.formatHelpers;

// 挂载css variables的html tag
const EZREAL_THEME_TAG = "body";
const EZREAL_PREFIX = "ezreal";
const SIZE_UNIT = "px";
const numberRegex = /^\d+$/;
const dimensionTokenArr = ["spacing", "borderRadius"];
const shapeAttributes = ["borderRadius", "borderWidth"];

/**
 * Helper: Append custom header
 */
StyleDictionary.registerFileHeader({
  name: "appendCustomHeader",
  fileHeader: () => {
    return [WARNING_FILE_HEADER];
  },
});

/**
 * Helper: Transforms dimensions to px
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformDimension",
  matcher: (token) => {
    const { type, value } = token;
    return dimensionTokenArr.includes(type) && numberRegex.test(value);
  },
  transformer: (token) => {
    const value = token.original.value;
    return value + SIZE_UNIT;
  },
});

/**
 * Helper: Transforms border-radius
 * 16,16,0,0 => 16px 16px 0px 0px
 * 8 => 8px
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformBorderRadius",
  matcher: (token) => {
    return token.type === "borderRadius";
  },
  transformer: (token) => {
    const borderRadiusArr = token.original.value.split(",");
    const borderRadiusArrWithUnit = borderRadiusArr.map((item) => {
      if (numberRegex.test(item)) {
        return item + SIZE_UNIT;
      }
      return item;
    });
    return borderRadiusArrWithUnit.join(" ");
  },
});

/**
 * Helper: Transforms border-width
 * 8 => 8px
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformBorderWidth",
  matcher: (token) => {
    return token.type === "borderWidth";
  },
  transformer: (token) => {
    const {
      original: { value },
    } = token;
    if (numberRegex.test(value)) {
      return value + SIZE_UNIT;
    }
    return value;
  },
});

/**
 * Helper: Transforms color to r,g,b format
 * e.g. #1d4ee3 to 29,78,227
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformPalette2Rgb",
  matcher: (token) => {
    const { category, type } = token.attributes;
    return category === "ref" && type === "palette";
  },
  transformer: (token) => {
    const color = tinycolor(token.original.value);
    const { r, g, b, a } = color.toRgb();
    return [r, g, b, a].join(",");
  },
});

/**
 * Creates a CSS file with variable definitions based on the style dictionary
 *
 * ```css
 * body {
 *   --color-background-base: #f0f0f0;
 *   --color-background-alt: #eeeeee;
 * }
 * ```
 */
StyleDictionary.registerFormat({
  name: "defaultFormat",
  formatter({ dictionary, options = {}, file }) {
    const selector = options.selector ? options.selector : `:root`;
    const { outputReferences, formatting, filterOutput, fileImport } = options;
    const header = fileHeader({ file });
    const cssVariables = formattedVariables({
      format: "css",
      dictionary,
      outputReferences,
      formatting,
      filterOutput,
    });
    return `${header}${
      fileImport ?? ""
    }\n\n${selector} {\n${cssVariables}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: "componentFormat",
  formatter: componentFormatter,
});

/**
 * Split system color token into light and dark modes
 *
 * ```css
 * body {
 *   --ezreal-sys-color-on-primary: var(--ezreal-ref-palette-primary-primary100);
 *   --ezreal-sys-color-primary: var(--ezreal-ref-palette-primary-primary40);
 * }
 *
 * body[ezreal-theme="dark"] {
 *   --ezreal-sys-color-on-primary: var(--ezreal-ref-palette-primary-primary20);
 *   --ezreal-sys-color-primary: var(--ezreal-ref-palette-primary-primary80);
 * }
 * ```
 */
StyleDictionary.registerFormat({
  name: "sysColorFormat",
  formatter: sysColorFormatter,
});

const DEFAULT_TRANSFORMS = [
  "attribute/cti",
  "name/cti/kebab",
  "color/css",
  "transformDimension",
  "transformPalette2Rgb",
  "transformBorderRadius",
  "transformBorderWidth",
];

function getThemeStyleDictionaryConfig({
  fileName,
  format,
  filter,
  filterOutput,
  fileImport,
}: {
  fileName: string;
  format?: string;
  filter?: (token: any) => boolean;
  filterOutput?: (token: any) => boolean;
  fileImport?: string;
}): Config {
  return {
    source: [...coreTokenFiles],
    platforms: {
      css: {
        transforms: DEFAULT_TRANSFORMS,
        buildPath: `${outputPath}/theme/`,
        files: [
          {
            destination: `${fileName}.less`,
            format: format || "defaultFormat",
            filter,
            options: {
              outputReferences: true,
              selector: EZREAL_THEME_TAG,
              fileHeader: "appendCustomHeader",
              fileImport,
              formatting: {
                // Add prefix to css variable, such as `@ezreal-ref-font-weight-regular`
                prefix: `--${EZREAL_PREFIX}-`,
              },
              filterOutput,
            },
          },
        ],
      },
    },
  };
}

function getCompStyleDictionaryConfig(themePath: string): Config {
  // fileName must be the same as the component class name, for example, button.json. The class name of the Button component is ezreal-button
  const fileName = themePath.split("/").pop().replace(".json", "");
  const componentName = paramCase(fileName);
  return {
    source: [...componentTokenFiles, ...coreTokenFiles],
    platforms: {
      css: {
        transforms: DEFAULT_TRANSFORMS,
        buildPath: `${outputPath}/components/`,
        files: [
          {
            destination: `${componentName}.less`,
            format: "componentFormat",
            filter: (token) => {
              const { category } = token.attributes;
              return category === componentName;
            },
            options: {
              outputReferences: true,
              selector:
                EZREAL_THEME_TAG || `.${EZREAL_PREFIX}-${componentName}`,
              fileHeader: "appendCustomHeader",
              formatting: {
                // Add prefix to css variable, such as `@ezreal-ref-font-weight-regular`
                prefix: `--${EZREAL_PREFIX}-`,
              },
            },
          },
        ],
      },
    },
  };
}

const themeFile = [
  {
    fileName: "ref-palette",
    filter: (token) => {
      const { category, type } = token.attributes;
      return category === "ref" && type === "palette";
    },
  },
  {
    fileName: "ref-spacing",
    filter: (token) => {
      const { category, type } = token.attributes;
      return category === "ref" && type === "spacing";
    },
  },
  {
    fileName: "ref-shape",
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      return category === "ref" && shapeAttributes.includes(type);
    },
  },
  {
    fileName: "sys-shape",
    fileImport: `@import "./ref-shape.less";`,
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      return category === "sys" && shapeAttributes.includes(type);
    },
  },
  {
    fileName: "sys-spacing",
    fileImport: `@import "./ref-spacing.less";`,
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      return category === "sys" && type === "spacing";
    },
  },
  {
    fileName: "sys-color",
    fileImport: `@import "./ref-palette.less";`,
    format: "sysColorFormat",
  },
];

themeFile.map(function (theme) {
  const SD = StyleDictionary.extend(getThemeStyleDictionaryConfig(theme));
  SD.buildAllPlatforms();
});

componentTokenFiles.map(function (file) {
  const SD = StyleDictionary.extend(getCompStyleDictionaryConfig(file));
  SD.buildAllPlatforms();
});

// create index.less and export all less files
generatIndexFile();
