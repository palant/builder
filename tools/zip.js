/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import Zip from "adm-zip";

import {MemoryFile} from "../file.js";

export default async function* zip(files, name = "zip")
{
  let zip = new Zip();
  for await (let file of files)
  {
    file = await file.read();
    zip.addFile(file.path, file.buffer);
  }
  yield new MemoryFile(name, zip.toBuffer());
}
