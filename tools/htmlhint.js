/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import fs from "fs/promises";

import {HTMLHint} from "htmlhint";

export default async function* htmlhint(files, options = {})
{
  if (options.htmlhintrc)
  {
    let optionsFile = await fs.readFile(options.htmlhintrc, "utf-8");
    options = Object.assign({}, JSON.parse(optionsFile), options);
    delete options.htmlhintrc;
  }

  options = Object.assign({}, HTMLHint.defaultRuleset, options);

  let seenErrors = false;
  for await (let file of files)
  {
    file = await file.read();

    let report = HTMLHint.verify(file.contents, options);
    if (report.length > 0)
    {
      console.log(`HTMLHint found ${report.length} ${report.length > 1 ? "errors" : "error"} in file ${file.path}`);
      console.log(HTMLHint.format(report, {
        colors: true,
        indent: 2
      }).join("\n"));
      seenErrors = true;
    }

    yield file;
  }

  if (seenErrors)
    throw null;
}
