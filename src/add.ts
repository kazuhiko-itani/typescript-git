import { readFileSync } from "fs";
import { join } from "path";
import { indexParser } from "./helpers/parser";
import { getGitRootPath } from "./helpers/path";

export const add = (): void => {
  const content = readFileSync(join(getGitRootPath(), "index"));
  console.log(indexParser(content));
};
