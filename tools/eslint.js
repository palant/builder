/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import {ESLint} from "eslint";

export default async function* eslint(files, options = {})
{
  let eslint = new ESLint(options);
  let results = [];
  let seenErrors = false;
  for await (let file of files)
  {
    if (await eslint.isPathIgnored(file.path))
      continue;

    file = await file.read();

    let fileResults = await eslint.lintText(file.contents, {filePath: file.path});
    results = results.concat(fileResults);

    yield file;
  }

  let formatter = await eslint.loadFormatter();
  let formatted = formatter.format(results);
  if (formatted)
    console.log(formatted);

  if (ESLint.getErrorResults(results).length > 0)
    throw null;
}
