/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import globPromise from "glob-promise";
import minimatch from "minimatch";

import {Files} from "./files.js";
import {PhysicalFile} from "./file.js";
import {unique} from "./utils.js";

async function* src(globs = [], options = {})
{
  let positive = [];
  let negative = [];

  options = Object.assign({}, options, {
    nodir: true
  });

  if (!Array.isArray(globs))
    globs = [globs];

  for (let glob of globs)
  {
    if (typeof glob != "string")
      throw new Error(`Glob ${glob} is not a string`);

    glob = glob.trim();
    if (glob.startsWith("!") && !glob.startsWith("!("))
      negative.push(glob.substr(1));
    else
      positive.push(glob);
  }

  if (positive.length == 0 && negative.length > 0)
    throw new Error("Need at least one positive glob to be negated");

  for await (let path of unique(positive.map(glob => globPromise(glob, options))))
    if (!negative.some(glob => minimatch(path, glob, options)))
      yield new PhysicalFile(path);
}

export default function(...args)
{
  return new Files(src(...args));
}
