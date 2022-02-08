Builder: A gulp-like build system with modern JavaScript
--------------------------------------------------------

What is this?
=============

This is a build system meant to automate tasks. At this point it’s merely a concept tailored for my own needs. It has been made to mimic [gulp](https://gulpjs.com/) APIs, with the goal of making integration of third-party tools much simpler than with gulp’s streaming approach. Even for APIs with identical names, the behavior may be different from gulp, and implementing the full scope of gulp functionality was never the goal.

I won’t maintain any functionality here beyond what I need myself. Feel free to fork this project and extend it however.

Sample build file
=================

This build file will validate all JavaScript files in the `scripts/` directory with ESLint, then concatenate them into one big `main.js` script and put it into the `assets/` directory. Running it with `clean` command line parameter will remove the `assets/` directory again.

File processing is generally being done by means of [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of), making it easy to implement custom handling and to integrate third-party tools. Here, function `concat()` exemplifies the approach.

```js
import {series, MemoryFile} from "builder";
import eslint from "./eslint.js";

export function clean()
{
  return this.src("assets/**").rm();
}

async function* concat(files, targetFileName)
{
  let result = [];
  for await (let file of files)
  {
    file = await file.read();
    result.push(file.contents);
  }
  yield new MemoryFile(targetFileName, result.join("\n"));
}

function eslintTask()
{
  return this.src("scripts/**/*.js").pipe(eslint);
}
export {eslintTask as eslint};

export let scripts = series(eslintTask, function(files)
{
  return files.pipe(concat, "main.js").dest("assets");
});

export default scripts;
```

You can also see a more complicated real-life example [in the PfP project](https://github.com/palant/pfp/blob/main/build.js).

API reference
=============

* `series(task...)`: Executes a number of tasks consecutively, passing the result of the previous task as the input parameter of the next one.
* `parallel(task...)`: Executes a number of tasks in parallel, passing its input parameter if any to all of them.
* `Builder` class: `this` pointer will be set to an instance of this class when tasks execute
  * `constructor(flags)`: Creates a new `Builder` instance. `flags` is a `Map` instance with optional command line flags to be exposed to tasks.
  * `load(buildFile)`: Loads tasks from the specified build file.
  * `run(taskNames)`: Runs the tasks specified in the `taskNames` array consecutively. Only names of tasks exported in the build file can be specified.
  * `src(globs, [options])`: compiles a `Files` object with files matching the globs specified. The `globs` parameter can either be a single string or an array containing multiple globs. Globs starting with `!` will be used to exclude files from the result. For information on glob syntax and options see [glob package](https://www.npmjs.com/package/glob).
  * `hasFlag(name)`: Checks whether a particular command-line flag was specified.
  * `getFlag(name)`: Retrieves the value of a particular command-line flag (will be `true` if no value was given).
  * `log(value...)`: Logs the parameters to console, prefixed with the current time.
  * `Builder.current`: This static property will be set to the `Builder` instance currently running tasks.
* `Files` class: a collection of files as returned by `src()` function or passed as first task parameter (result of the previous task in a series).
  * `constructor(value...)`: A parameter can be either a `File` instance or an iterable resolving to `File` instances. Any promises will be resolved and nested iterables are allowed.
  * `Symbol.asyncIterator`: Allows async iteration over the files, yielding `File` instances.
  * `async ensureCompletion()`: Asynchronously iterates over the files, making sure any promises are resolved. Returns a new `Files` instance.
  * `pipe(handler, parameter...)`: Passes the files to the specified handler (usually an async generator). Returns a new `Files` instance containing the files produces by the handler. Any parameters specified will be passed to the handler in addition to the current `Files` instance.
  * `dest(targetDir)`: Saves all files to the specified directory. Returns a new `Files` instance containing the saved files.
  * `rename(newName)`: Renames all files. `newName` can either be a string or a function taking a `File` instance and returning its new name. Returns a new `Files` instance containing renamed files.
  * `rm()`: Removes all files from disk, also removing their parent directories if these are empty. Returns a new empty `Files` instance.
  * `watch(tasks)`: Waits forever watching for changes in the specified files. When a file changes, the specified tasks (single task or an array of tasks) will be run in parallel.
* `File` class is the common base class of `PhysicalFile` and `MemoryFile`
  * `path`: File path, usually relative to the build file.
  * `read()`: Reads the file from disk if necessary, returns a `MemoryFile` instance.
* `PhysicalFile` class: Represents a file on disk. Call `file.read()` if you need to work with file contents.
  * `constructor(path)`
* `MemoryFile` class: Represents a file in memory. This could be a physical file read into memory and possibly modified or an entirely virtual file not stored on disk at all.
  * `constructor(path, contents)`: `contents` can either be a `Buffer` instance or a string. The latter will result in UTF-8 encoding.
  * `buffer`: The `Buffer` instance with the file contents.
  * `contents`: The UTF-8 decoded file contents as a string.
