/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

/**
 * I rewrite this function, see https://github.com/amzn/style-dictionary/issues/941
 */

import type { Dictionary } from "style-dictionary";

const defaultFormatting = {
  prefix: "",
  commentStyle: "long",
  indentation: "",
  separator: " =",
  suffix: ";",
};

/**
 * Creates a function that can be used to format a property. This can be useful
 * to use as the function on `dictionary.allTokens.map`. The formatting
 * is configurable either by supplying a `format` option or a `formatting` object
 * which uses: prefix, indentation, separator, suffix, and commentStyle.
 * @memberof module:formatHelpers
 * @example
 * ```javascript
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   formatter: function({ dictionary, options }) {
 *     const { outputReferences } = options;
 *     const formatProperty = createPropertyFormatter({
 *       outputReferences,
 *       dictionary,
 *       format: 'css'
 *     });
 *     return dictionary.allTokens.map(formatProperty).join('\n');
 *   }
 * });
 * ```
 * @param {Object} options
 * @param {Boolean} options.outputReferences - Whether or not to output references. You will want to pass this from the `options` object sent to the formatter function.
 * @param {Boolean} options.outputReferenceFallbacks - Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the formatter function.
 * @param {Dictionary} options.dictionary - The dictionary object sent to the formatter function
 * @param {String} options.format - Available formats are: 'css', 'sass', 'less', and 'stylus'. If you want to customize the format and can't use one of those predefined formats, use the `formatting` option
 * @param {Object} options.formatting - Custom formatting properties that define parts of a declaration line in code. The configurable strings are: prefix, indentation, separator, suffix, and commentStyle. Those are used to generate a line like this: `${indentation}${prefix}${prop.name}${separator} ${prop.value}${suffix}`
 * @param {Boolean} options.themeable [false] - Whether tokens should default to being themeable.
 * @returns {Function}
 */
function createPropertyFormatter({
  outputReferences = false,
  outputReferenceFallbacks = false,
  dictionary,
  format,
  formatting = {},
  themeable = false,
}: {
  outputReferences?: boolean;
  outputReferenceFallbacks?: boolean;
  dictionary: Dictionary;
  format;
  formatting?: Record<string, string>;
  themeable?: boolean;
}) {
  switch (format) {
    case "css":
      defaultFormatting.prefix = "--";
      defaultFormatting.indentation = "  ";
      defaultFormatting.separator = ":";
      break;
    case "sass":
      defaultFormatting.prefix = "$";
      defaultFormatting.commentStyle = "short";
      defaultFormatting.indentation = "";
      defaultFormatting.separator = ":";
      break;
    case "less":
      defaultFormatting.prefix = "@";
      defaultFormatting.commentStyle = "short";
      defaultFormatting.indentation = "";
      defaultFormatting.separator = ":";
      break;
    case "stylus":
      defaultFormatting.prefix = "$";
      defaultFormatting.commentStyle = "short";
      defaultFormatting.indentation = "";
      defaultFormatting.separator = "=";
      break;
    default:
      defaultFormatting.prefix = "--";
      defaultFormatting.indentation = "  ";
      defaultFormatting.separator = ":";
      break;
  }

  const { prefix, commentStyle, indentation, separator, suffix } =
    Object.assign({}, defaultFormatting, formatting);

  return function (prop) {
    let toRetProp = `${indentation}${prefix}${prop.name}${separator} `;
    let value = prop.value;

    /**
     * A single value can have multiple references either by interpolation:
     * "value": "{size.border.width.value} solid {color.border.primary.value}"
     * or if the value is an object:
     * "value": {
     *    "size": "{size.border.width.value}",
     *    "style": "solid",
     *    "color": "{color.border.primary.value"}
     * }
     * This will see if there are references and if there are, replace
     * the resolved value with the reference's name.
     */
    if (outputReferences && dictionary.usesReference(prop.original.value)) {
      // Formats that use this function expect `value` to be a string
      // or else you will get '[object Object]' in the output
      if (typeof value === "string") {
        const refs = dictionary.getReferences(prop.original.value);
        refs.forEach((ref) => {
          // value should be a string that contains the resolved reference
          // because Style Dictionary resolved this in the resolution step.
          // Here we are undoing that by replacing the value with
          // the reference's name
          if (ref.value && ref.name) {
            value = value.replace(ref.value, function () {
              if (format === "css") {
                if (outputReferenceFallbacks) {
                  return `var(${prefix}${ref.name}, ${ref.value})`;
                }
                return `var(${prefix}${ref.name})`;
              }
              return `${prefix}${ref.name}`;
            });
          }
        });
      }
    }

    toRetProp += prop.attributes.category === "asset" ? `"${value}"` : value;

    const themeableProp =
      typeof prop.themeable === "boolean" ? prop.themeable : themeable;
    if (format === "sass" && themeableProp) {
      toRetProp += " !default";
    }

    toRetProp += suffix;

    if (prop.comment && commentStyle !== "none") {
      if (commentStyle === "short") {
        toRetProp = toRetProp.concat(` // ${prop.comment}`);
      } else {
        toRetProp = toRetProp.concat(` /* ${prop.comment} */`);
      }
    }

    return toRetProp;
  };
}

export { createPropertyFormatter };
