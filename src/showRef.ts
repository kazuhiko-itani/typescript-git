import { existsSync, lstatSync, readdirSync } from "fs";
import { join } from "path";
import { getGitRootPath, getRefRootPath } from "./helpers/path";
import { refResolve } from "./helpers/ref";

export const showRef = (ref = ""): void => {
  showRefList(join(getRefRootPath(), ref));
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
      const hash = refResolve(itemPath);
      console.log(hash, itemPath.replace(`${getGitRootPath()}/`, ""));
    }
  }
};
