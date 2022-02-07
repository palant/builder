/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

import {HtmlValidate, Reporter, formatterFactory} from "html-validate";

export default async function* htmlValidate(files, options = {})
{
  let validator = new HtmlValidate(options);
  let reports = [];
  for await (let file of files)
  {
    file = await file.read();
    reports.push(validator.validateString(file.contents, file.path));
    yield file;
  }

  let report = Reporter.merge(reports);
  if (!report.valid)
  {
    console.log(formatterFactory("stylish")(report.results));
    throw null;
  }
}
