import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getGitPath } from "./path";

export const refResolve = (absolutePath: string): string => {
  if (!existsSync(absolutePath)) {
    throw Error(`${absolutePath} is not exists.`);
  }

  const ref = readFileSync(absolutePath, "ascii").replace("\n", "");

  if (ref.startsWith("ref: ")) {
    return refResolve(join(getGitPath(), ref.slice(5)));
  }

  return ref;
};
