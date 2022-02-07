/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import Mocha from "mocha";

import {PhysicalFile} from "../file.js";

export default async function* mocha(files, options = {})
{
  let mocha = new Mocha(options);

  for await (let file of files)
  {
    if (!(file instanceof PhysicalFile))
      throw new Error("Mocha only works on physical files");

    mocha.addFile(file.path);
    yield file;
  }

  await mocha.loadFilesAsync();
  await new Promise((resolve, reject) =>
  {
    mocha.run(failures => failures ? reject(new Error(`${failures} test(s) failed`)) : resolve());
  });
}
