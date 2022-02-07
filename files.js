/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import dest from "./dest.js";
import {File} from "./file.js";
import rename from "./rename.js";
import rm from "./rm.js";
import watch from "./watch.js";
import {flatten} from "./utils.js";

export class Files
{
  #iterable;

  constructor(...iterable)
  {
    this.#iterable = iterable;
  }

  async* [Symbol.asyncIterator]()
  {
    for await (let file of flatten(this.#iterable))
    {
      if (!(file instanceof File))
        throw new Error(`Expected a File instance, got ${file}`);
      yield file;
    }
  }

  async ensureCompletion()
  {
    let files = [];
    for await (let file of this)
      files.push(file);
    return new Files(files);
  }

  pipe(handler, ...args)
  {
    return new Files(handler(this, ...args));
  }

  dest(...args)
  {
    return this.pipe(dest, ...args);
  }

  rename(...args)
  {
    return this.pipe(rename, ...args);
  }

  rm(...args)
  {
    return this.pipe(rm, ...args);
  }

  watch(...args)
  {
    return this.pipe(watch, ...args);
  }
}
