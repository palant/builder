/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

export function isIterable(value)
{
  if (!value || typeof value == "string")
    return false;

  return typeof value[Symbol.asyncIterator] == "function" || typeof value[Symbol.iterator] == "function";
}

export async function* flatten(input)
{
  input = await input;
  if (input)
  {
    if (isIterable(input))
    {
      for await (let entry of input)
        yield* flatten(entry);
    }
    else
      yield input;
  }
}

export async function* unique(input)
{
  let known = new Set();
  for await (let entry of flatten(input))
  {
    if (!known.has(entry))
    {
      known.add(entry);
      yield entry;
    }
  }
}
