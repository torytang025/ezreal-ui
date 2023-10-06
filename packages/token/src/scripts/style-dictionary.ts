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
  sysElevationFormatter,
} from "./utils/tokenFormatter.ts";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const tokenPath = path.resolve(__dirname, "../tokens");
const componentTokenFiles = globSync(`${tokenPath}/components/*.json`);
const coreTokenFiles = globSync(`${tokenPath}/core/*.json`);

const { fileHeader } = StyleDictionary.formatHelpers;

// 挂载css variables的html tag
const EZREAL_THEME_TAG = "body";
const EZREAL_PREFIX = "ezreal";
const SIZE_UNIT = "px";
const numberRegex = /^\d+$/;
const typefaceTokenArr = [
  "fontFamily",
  "lineHeight",
  "fontWeight",
  "fontSize",
  "letterSpacing",
];
const dimensionTokenArr = [
  "lineHeights",
  "spacing",
  "borderRadius",
  "fontSizes",
];

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
 * Helper: Transforms letter spacing decimal/% to em
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformLetterSpacing",
  matcher: (token) => {
    const { type, category } = token.attributes;
    return type === "letterSpacing" && category === "ref";
  },
  transformer: (token) => {
    const value = token.original.value;
    // if (value.endsWith("%")) {
    //   const percentValue = value.slice(0, -1);
    //   return `${percentValue / 100}em`;
    // }
    return `${value}px`;
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
 * Helper: Transforms boxShadow object to shadow shorthand
 * [
    {
        "color":"#0000001f",
        "type":"dropShadow",
        "x":"0",
        "y":"1",
        "blur":"24",
        "spread":"0"
    },
    {
        "color":"#0000000f",
        "type":"dropShadow",
        "x":"0",
        "y":"0",
        "blur":"40",
        "spread":"3"
    }
  ]
  =>
  0px 1px 24px 0px #0000001f, 0px 0px 40px 3px #0000000f
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "transformBoxShadow",
  matcher: (token) => {
    const {
      attributes: { category },
      type,
    } = token;
    return category === "sys" && type === "boxShadow";
  },
  transformer: (token) => {
    const value = token.original.value;
    const boxShadowArr = value.map((shadow) => {
      let { x, y, blur, spread } = shadow;
      const { color } = shadow;
      x += SIZE_UNIT;
      y += SIZE_UNIT;
      blur += SIZE_UNIT;
      spread += SIZE_UNIT;
      return `${x} ${y} ${blur} ${spread} ${color}`;
    });
    return boxShadowArr.join(", ");
  },
});

/**
 * Helper: Transforms font-family
 * lowerCase reference token value
 */
StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "lowerCaseFontFamilies",
  matcher: (token) => {
    const isRefToken =
      token.attributes.category === "ref" || token.path.includes("ref");
    return isRefToken && token.type === "fontFamilies";
  },
  transformer: (token) => {
    return token.original.value.toLocaleLowerCase();
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
    const { r, g, b } = color.toRgb();
    return [r, g, b].join(",");
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

/**
 * Split system elevation token into light and dark modes
 *
 * ```css
 * body {
 *   --ezreal-sys-elevation-low: 0px 1px 16px 1px #0000000a, 0px 0px 1px 0px #00000014;
 *   --ezreal-sys-elevation-medium: 0px 1px 16px 2px #1b1c1f1a, 0px 0px 1px 0px #1b1c1f0a;
 *   --ezreal-sys-elevation-high: 0px 1px 24px 0px #0000001f, 0px 0px 40px 3px #0000000f;
 * }
 *
 * body[ezreal-theme="dark"] {
 *   --ezreal-sys-elevation-low: 0px 1px 24px 0px #0000000a, 0px 0px 2px 1px #0000003d;
 *   --ezreal-sys-elevation-medium: 0px 1px 12px 0px #00000014, 0px 0px 1px 2px #0000001f;
 *   --ezreal-sys-elevation-high: 0px 1px 3px 0px #0000004d, 0px 0px 8px 3px #00000026;
 * }
 * ```
 */
StyleDictionary.registerFormat({
  name: "sysElevationFormat",
  formatter: sysElevationFormatter,
});

const DEFAULT_TRANSFORMS = [
  "attribute/cti",
  "name/cti/kebab",
  "color/css",
  "transformDimension",
  "transformPalette2Rgb",
  "transformLetterSpacing",
  "lowerCaseFontFamilies",
  "transformBoxShadow",
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
        buildPath: "src/style/theme/",
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
        buildPath: "src/style/components/",
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
    // transform filter
    filter: (token) => {
      const { category, type } = token.attributes;
      return category === "ref" && type === "palette";
    },
  },
  {
    fileName: "ref-typeface",
    filter: (token) => {
      const { category, type } = token.attributes;
      return category === "ref" && typefaceTokenArr.includes(type);
    },
  },
  {
    fileName: "sys-shape",
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      const shapeAttributes = ["borderRadius", "borderWidth"];
      return category === "sys" && shapeAttributes.includes(type);
    },
  },
  {
    fileName: "sys-spacing",
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      return category === "sys" && type === "spacing";
    },
  },
  {
    fileName: "sys-state",
    filter: (token) => {
      const { category } = token.attributes;
      const {
        original: { type },
      } = token;
      return category === "sys" && type === "opacity";
    },
  },
  {
    fileName: "sys-typography",
    filter: (token) => {
      const { type, state } = token.attributes;
      return (
        typefaceTokenArr.includes(type) ||
        (type === "typography" && typefaceTokenArr.includes(state))
      );
    },
    filterOutput: (token) => {
      return token.trim().startsWith("--ezreal-sys-typography");
    },
    fileImport: `@import "./ref-typeface.less";`,
  },
  {
    fileName: "sys-color",
    fileImport: `@import "./ref-palette.less";`,
    format: "sysColorFormat",
  },
  {
    fileName: "sys-elevation",
    format: "sysElevationFormat",
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
