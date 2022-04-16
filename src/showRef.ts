import { existsSync, lstatSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getGitPath, getRefPath } from "./helpers/path";

export const showRef = (ref = ""): void => {
  showRefList(join(getRefPath(), ref));
};

const showRefList = (path: string) => {
  if (!existsSync(path)) {
    throw Error(`${path} is not exists.`);
  }

  const items = readdirSync(path);

  for (const item of items) {
    const itemPath = join(path, item);
    if (lstatSync(itemPath).isDirectory()) {
      showRefList(itemPath);
    } else {
      refResolve(itemPath);
    }
  }
};

const refResolve = (absolutePath: string) => {
  if (!existsSync(absolutePath)) {
    throw Error(`${absolutePath} is not exists.`);
  }

  const ref = readFileSync(absolutePath, "ascii").replace("\n", "");

  if (ref.startsWith("ref: ")) {
    refResolve(join(getGitPath(), ref.slice(5)));
  } else {
    console.log(ref, absolutePath.replace(`${getGitPath()}/`, ""));
  }
};
