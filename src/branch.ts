import { existsSync, lstatSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getGitRootPath, getRefRootPath } from "./helpers/path";
import { refResolve } from "./helpers/ref";

export const showBranch = (): void => {
  showBranchName(join(getRefRootPath(), "heads"));
};

const showBranchName = (path: string) => {
  const items = readdirSync(path);

  for (const item of items) {
    const itemPath = join(path, item);

    if (lstatSync(itemPath).isDirectory()) {
      showBranchName(itemPath);
    } else {
      console.log(itemPath.replace(`${join(getRefRootPath(), "heads")}/`, ""));
    }
  }
};

export const createBranch = (branchName: string, isSwitch: boolean): void => {
  const branchPath = join(getRefRootPath(), "heads", branchName);
  if (existsSync(branchPath)) {
    throw Error(`${branchName} already exists.`);
  }

  const currentRef = refResolve(join(getGitRootPath(), "HEAD"));
  writeFileSync(branchPath, currentRef);

  if (isSwitch) {
    writeFileSync(join(getGitRootPath(), "HEAD"), currentRef);
  }
};
