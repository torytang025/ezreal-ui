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
 * I rewrite this function, adding a filterOutput to options. see line 37
 */

import StyleDictionary from "style-dictionary";
import { createPropertyFormatter } from "./createPropertyFormatter.ts";

const { sortByReference } = StyleDictionary.formatHelpers;

const defaultFormatting = {
  lineSeparator: "\n",
};

/**
 *
 * This is used to create lists of variables like Sass variables or CSS custom properties
 * @memberof module:formatHelpers
 * @param {Object} options
 * @param {String} options.format - What type of variables to output. Options are: css, sass, less, and stylus
 * @param {Object} options.dictionary - The dictionary object that gets passed to the formatter method.
 * @param {Boolean} options.outputReferences - Whether or not to output references
 * @param {Object} options.formatting - Custom formatting properties that define parts of a declaration line in code. This will get passed to `formatHelpers.createPropertyFormatter` and used for the `lineSeparator` between lines of code.
 * @param {Boolean} options.themeable [false] - Whether tokens should default to being themeable.
 * @param {Function} options.filterOutput - A function that takes a token and returns a boolean if the token should be included (true) or excluded (false). This is only available if you are defining your configuration in Javascript.
 * @returns {String}
 * @example
 * ```js
 * StyleDictionary.registerFormat({
 *   name: "myCustomFormat",
 *   formatter: function({ dictionary, options }) {
 *     return formattedVariables({
 *       format: "less",
 *       dictionary,
 *       outputReferences: options.outputReferences
 *     });
 *   }
 * });
 * ```
 */
function formattedVariables({
  format,
  dictionary,
  outputReferences = false,
  formatting = {},
  themeable = false,
  filterOutput,
}) {
  let { allTokens } = dictionary;

  const { lineSeparator } = Object.assign({}, defaultFormatting, formatting);

  // Some languages are imperative, meaning a variable has to be defined
  // before it is used. If `outputReferences` is true, check if the token
  // has a reference, and if it does send it to the end of the array.
  // We also need to account for nested references, a -> b -> c. They
  // need to be defined in reverse order: c, b, a so that the reference always
  // comes after the definition
  if (outputReferences) {
    // note: using the spread operator here so we get a new array rather than
    // mutating the original
    allTokens = [...allTokens].sort(sortByReference(dictionary));
  }

  const formatProperty = createPropertyFormatter({
    outputReferences,
    dictionary,
    format,
    formatting,
    themeable,
  });

  if (!filterOutput) {
    filterOutput = () => true;
  }

  return allTokens
    .map(formatProperty)
    .filter(function (strVal) {
      return !!strVal;
    })
    .filter(filterOutput)
    .join(lineSeparator);
}

export { formattedVariables };
