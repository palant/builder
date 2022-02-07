/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import path from "path";

import sass from "sass";

import {PhysicalFile, MemoryFile} from "../file.js";

export default async function* sass_(files)
{
  for await (let file of files)
  {
    if (path.basename(file.path).startsWith("_"))
      continue;

    if (!(file instanceof PhysicalFile))
      throw new Error("Sass only works on physical files");

    // Replace file extension by .css
    let newPath = path.join(path.dirname(file.path), path.basename(file.path, path.extname(file.path))) + ".css";

    yield new MemoryFile(newPath, sass.compile(file.path).css);
  }
}
