import { existsSync } from "fs";
import { join, resolve } from "path";
import { GIT_DIR_NAME } from "../domain";

const getRepoRootPath = (currentPath = "."): string => {
  const realPath = resolve(currentPath);

  if (existsSync(join(realPath, ".git"))) {
    return realPath;
  }

  const parent = resolve(realPath, "..");
  if (parent == currentPath) {
    throw Error("No git repo directory");
  }

  return getRepoRootPath(parent);
};

export const getGitRootPath = (): string => {
  const repoPath = getRepoRootPath();
  const targetRepoName = process.env.TARGET_REPO_NAME;
  if (!targetRepoName) {
    throw Error("TARGET_REPO_NAME env must set");
  }

  if (!existsSync(targetRepoName)) {
    throw Error(`${targetRepoName} don't exist.`);
  }

  return join(repoPath, targetRepoName, GIT_DIR_NAME);
};

export const getGitObjectDirNameFromHash = (hash: string): string => {
  return join(getGitRootPath(), "objects", hash.slice(0, 2));
};

export const getGitObjectPathFromHash = (hash: string): string => {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);

  return join(getGitRootPath(), "objects", dir, file);
};

export const getCheckoutRepoRootPath = (): string => {
  const checkoutRepo = process.env.TARGET_REPO_NAME;
  if (!checkoutRepo) {
    throw Error("CHECK_REPO_NAME env is must set");
  }

  if (!existsSync(checkoutRepo)) {
    throw Error(`${checkoutRepo} is not exist.`);
  }

  return join(getRepoRootPath(), checkoutRepo);
};

export const getRefRootPath = (): string => {
  return join(getGitRootPath(), "refs");
};
