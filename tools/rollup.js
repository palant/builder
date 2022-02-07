/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import {rollup} from "rollup";

import {PhysicalFile, MemoryFile} from "../file.js";

export default async function* rollup_(files, inputOptions = {}, outputOptions = {})
{
  let chunkPaths = {};
  let i = 0;
  for await (let file of files)
  {
    if (!(file instanceof PhysicalFile))
      throw new Error("Rollup only works on physical files");

    let chunkName = "chunk" + ++i;
    chunkPaths[chunkName] = file.path;
  }

  inputOptions.input = chunkPaths;

  let bundle = await rollup(inputOptions);

  outputOptions = Object.assign({}, {dir: ""}, outputOptions);
  let {output} = await bundle.generate(outputOptions);

  for (let chunk of output)
  {
    if (!chunk.code)
      throw new Error("Unexpected rollup output");

    let path = chunkPaths[chunk.name];
    yield new MemoryFile(path || chunk.fileName, chunk.code);
  }
}
