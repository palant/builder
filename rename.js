/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import {MemoryFile} from "./file.js";

export default async function* rename(files, newName)
{
  if (typeof newName != "string" && typeof newName != "function")
    throw new Error("New file name has to be a string or a function");

  for await (let file of files)
  {
    file = await file.read();

    let target = newName;
    if (typeof target != "string")
      target = target(file.path, file);
    if (typeof target != "string")
      throw new Error("New file name has to be a string");

    yield new MemoryFile(target, file.buffer);
  }
}
