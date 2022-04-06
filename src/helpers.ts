import fs from "fs";
import path from "path";

export const getRepoPath = (currentPath = "."): string => {
  const realPath = path.resolve(currentPath);

  if (fs.existsSync(path.join(realPath, ".git"))) {
    return realPath;
  }

  const parent = path.resolve(realPath, "..");
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

  return path.join(repoPath, gitDirName);
};
