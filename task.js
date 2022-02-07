/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import {Files} from "./files.js";
import {flatten} from "./utils.js";

let handlerMap = new Map();
let nameMap = new Map();

export default class Task
{
  #handler;
  #promise = null;
  #running = false;

  constructor(handler, name)
  {
    if (typeof handler != "function")
      throw new Error("Task must be a function");

    if (name)
      nameMap.set(handler, name);

    if (handlerMap.has(handler))
      return handlerMap.get(handler);

    this.#handler = handler;
    handlerMap.set(handler, this);
  }

  get name()
  {
    return nameMap.get(this.#handler) || this.#handler.name;
  }

  async #run(scope, input)
  {
    this.#running = true;
    try
    {
      if (this.name)
      {
        scope.log(`Starting '${this.name}'...`);
        let startTime = Date.now();

        try
        {
          let result = await new Files(this.#handler.call(scope, input)).ensureCompletion();
          scope.log(`Finished '${this.name}' after ${formatTime(Date.now() - startTime)}`);
          return result;
        }
        catch (e)
        {
          scope.log(`'${this.name}' errored after ${formatTime(Date.now() - startTime)}`);
          if (e)
            console.error(e);
          return process.exit(1);
        }
      }
      else
        return await new Files(this.#handler.call(scope, input)).ensureCompletion();
    }
    finally
    {
      this.#running = false;
    }
  }

  get running()
  {
    return this.#running;
  }

  run(scope, input)
  {
    if (!input)
    {
      if (!this.#promise)
        this.#promise = this.#run(scope, input);
      return this.#promise;
    }
    else
      return this.#run(scope, input);
  }
}

function formatTime(interval)
{
  if (interval >= 1000)
    return (interval / 1000).toFixed(2) + " s";
  else
    return interval + " ms";
}

function validateTasks(tasks)
{
  return tasks.map(task =>
  {
    if (typeof task == "function")
      task = new Task(task);
    if (!(task instanceof Task))
      throw new Error(`Task instance or function expected, got ${task}`);
    return task;
  });
}

export function series(...tasks)
{
  tasks = validateTasks(tasks);
  return async function(input)
  {
    for (let task of tasks)
      input = await task.run(this, input);
    return input;
  };
}

export function parallel(...tasks)
{
  tasks = validateTasks(tasks);
  return async function(input)
  {
    return Promise.all(tasks.map(task => task.run(this, input)));
  };
}
