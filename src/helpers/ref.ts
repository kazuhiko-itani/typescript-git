import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getGitRootPath } from "./path";

export const refResolve = (absolutePath: string): string => {
  if (!existsSync(absolutePath)) {
    throw Error(`${absolutePath} is not exists.`);
  }

  const ref = readFileSync(absolutePath, "ascii").replace("\n", "");

  if (ref.startsWith("ref: ")) {
    return refResolve(join(getGitRootPath(), ref.slice(5)));
  }

  return ref;
};
