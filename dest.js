/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import fs from "fs/promises";
import path from "path";

import {PhysicalFile} from "./file.js";

export default async function* dest(files, directory)
{
  if (typeof directory != "string" && typeof directory != "undefined")
    throw new Error("Target directory has to be a string or undefined");

  for await (let file of files)
  {
    file = await file.read();

    let target = typeof directory == "undefined" ? file.path : path.join(directory, file.path);
    let dirname = path.dirname(target);
    if (dirname)
      await fs.mkdir(dirname, {recursive: true});

    await fs.writeFile(target, file.buffer);
    yield new PhysicalFile(target);
  }
}
