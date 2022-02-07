/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import fs from "fs/promises";

export class File
{
  #path;

  constructor(path)
  {
    this.#path = path;
  }

  get path()
  {
    return this.#path;
  }

  read()
  {
    throw new Error("Not implemented");
  }
}

export class PhysicalFile extends File
{
  constructor(path)
  {
    super(path);
  }

  async read()
  {
    let buffer = await fs.readFile(this.path);
    return new MemoryFile(this.path, buffer);
  }
}

export class MemoryFile extends File
{
  #buffer;

  constructor(path, buffer)
  {
    super(path);
    if (typeof buffer == "string")
      buffer = Buffer.from(buffer);
    if (!(buffer instanceof Buffer))
      throw new Error("Unexpected data, should be string or Buffer");
    this.#buffer = buffer;
  }

  get buffer()
  {
    return this.#buffer;
  }

  get contents()
  {
    return this.#buffer.toString();
  }

  async read()
  {
    return this;
  }
}
