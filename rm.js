/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import fs from "fs/promises";
import path from "path";

async function rmEmptyParents(filepath)
{
  let parent = path.dirname(filepath);
  if (!parent)
    return;

  let entries;
  try
  {
    entries = await fs.readdir(parent);
  }
  catch (e)
  {
    // Ignore missing directories
    return;
  }

  if (entries.length == 0)
  {
    await fs.rmdir(parent);
    await rmEmptyParents(parent);
  }
}

export default async function rm(files)
{
  for await (let file of files)
  {
    await fs.rm(file.path, {force: true});
    await rmEmptyParents(file.path);
  }
}
