import { existsSync } from "fs";
import { join, resolve } from "path";

export const getRepoRootPath = (currentPath = "."): string => {
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
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env is must set");
  }

  return join(repoPath, gitDirName);
};

export const getGitObjectPath = (hash: string): string => {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);

  return join(getGitRootPath(), "objects", dir, file);
};

export const getCheckoutRepoRootPath = (): string => {
  const checkoutRepo = process.env.CHECKOUT_REPO_NAME;
  if (!checkoutRepo) {
    throw Error("CHECK_REPO_NAME env is must set");
  }

  if (!existsSync(checkoutRepo)) {
    throw new Error(`${checkoutRepo} is not exist.`);
  }

  return join(getRepoRootPath(), checkoutRepo);
};

export const getRefRootPath = (): string => {
  return join(getGitRootPath(), "refs");
};
