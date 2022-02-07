/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import Builder from "./builder.js";

export default async function cli(args)
{
  let tasks = [];
  let flags = new Map();
  for (let arg of args)
  {
    if (arg.startsWith("--"))
    {
      if (arg.includes("="))
      {
        let [name, value] = arg.substr(2).split("=", 2);
        flags.set(name, value);
      }
      else
        flags.set(arg.substr(2), true);
    }
    else if (arg.startsWith("-"))
      flags.set(arg.substr(1), true);
    else
      tasks.push(arg);
  }

  if (tasks.length == 0)
    tasks.push("default");

  if (flags.has("help") || flags.has("h"))
  {
    console.log(`Usage: ${process.argv[1]} [options] task...`);
    console.log();
    console.log("Runs the specified tasks or the task named 'default' if none given.");
    console.log();
    console.log("Options:");
    console.log("--help, -h         Show this help and exit");
    console.log("--buildfile=file   Manually set build file path, default is build.js");
    console.log("--tasks            Print a list of available tasks and exit");
    process.exit();
  }

  let builder = new Builder(flags);

  let buildFile = flags.get("buildfile");
  if (!buildFile || typeof buildFile != "string")
    buildFile = "build.js";
  await builder.load(buildFile);

  if (flags.has("tasks"))
    builder.listTasks();
  else
    await builder.run(tasks);
}
