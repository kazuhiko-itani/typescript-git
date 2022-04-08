import { existsSync } from "fs";
import { join, resolve } from "path";

export const getRepoPath = (currentPath = "."): string => {
  const realPath = resolve(currentPath);

  if (existsSync(join(realPath, ".git"))) {
    return realPath;
  }

  const parent = resolve(realPath, "..");
  if (parent == currentPath) {
    throw Error("No git repo directory");
  }

  return getRepoPath(parent);
};

export const getGitPath = (): string => {
  const repoPath = getRepoPath();
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env is must set");
  }

  return join(repoPath, gitDirName);
};
