/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import path from "path";
import process from "process";
import url from "url";

import {Files} from "./files.js";
import {PhysicalFile, MemoryFile} from "./file.js";
import src from "./src.js";
import Task, {series, parallel} from "./task.js";

export {
  Files,
  PhysicalFile,
  MemoryFile,
  series,
  parallel
};

let current = null;

export default class Builder
{
  #taskMap = null;
  #buildFile = null;
  #flags;
  src = src;

  constructor(flags)
  {
    if (!(flags instanceof Map))
      throw new Error("flags has to be a map");

    this.#flags = flags;
  }

  async load(buildFile)
  {
    if (this.#buildFile)
      throw new Error("A build file is already loaded");

    this.#buildFile = path.resolve(buildFile);
    this.#taskMap = new Map();

    let module = await import(url.pathToFileURL(this.#buildFile).href);
    for (let name of Object.keys(module))
      if (typeof module[name] == "function")
        this.#taskMap.set(name, new Task(module[name], name));
  }

  listTasks()
  {
    if (!this.#buildFile)
      throw new Error("load method has to be called first");

    this.log(`Tasks for ${this.#buildFile}:`);
    for (let name of this.#taskMap.keys())
      this.log(name);
  }

  async run(taskNames)
  {
    if (!this.#buildFile)
      throw new Error("load method has to be called first");

    if (!Array.isArray(taskNames))
      throw new Error("taskNames has to be an array");

    this.log(`Using build file ${this.#buildFile}`);
    process.chdir(path.dirname(this.#buildFile));

    current = this;

    let getTask = name =>
    {
      let task = this.#taskMap.get(name);
      if (!task)
      {
        console.error(`Cannot run task ${name}, no such task defined. To list available tasks run with --tasks command line flag.`);
        process.exit(1);
      }
      return task;
    };

    for (let task of taskNames.map(getTask))
      await task.run(this);
  }

  log(...args)
  {
    console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
  }

  hasFlag(name)
  {
    return this.#flags.has(name);
  }

  getFlag(name)
  {
    return this.#flags.get(name);
  }

  static get current()
  {
    return current;
  }
}
