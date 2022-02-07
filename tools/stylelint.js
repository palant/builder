/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import stylelint from "stylelint";

import {MemoryFile} from "../file.js";

export default async function* stylelint_(files, options = {})
{
  options = Object.assign({formatter: "string"}, options);

  let seenErrors = false;
  for await (let file of files)
  {
    file = await file.read();
    options = Object.assign({}, options, {
      code: file.contents,
      codeFilename: file.path
    });

    let result = await stylelint.lint(options);
    if (options.fix && result.output)
      yield new MemoryFile(file.path, result.output);
    else
    {
      yield file;
      if (result.output)
        console.log(result.output);
    }
    if (result.errored)
      seenErrors = true;
  }

  if (seenErrors)
    throw null;
}
