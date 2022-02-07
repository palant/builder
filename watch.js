/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import fs from "fs/promises";

import Builder from "./builder.js";
import Task, {parallel} from "./task.js";

export default async function watch(files, tasks)
{
  if (!Array.isArray(tasks))
    tasks = [tasks];

  let scope = Builder.current;
  let run = parallel(...tasks).bind(scope);

  let watchers = [];
  for await (let file of files)
    watchers.push(fs.watch(file.path));

  let running = false;
  async function runTasks()
  {
    if (running)
      return;

    running = true;
    try
    {
      await run(files);
    }
    finally
    {
      running = false;
    }
  }

  scope.log("Waiting for file changes...");
  await Promise.all(watchers.map(async(watcher) =>
  {
    for await (let change of watcher)
      runTasks();
  }));
}
