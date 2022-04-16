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

export const getGitObjectPath = (hash: string): string => {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);

  return join(getGitPath(), "objects", dir, file);
};

export const getCheckoutRepo = (): string => {
  const checkoutRepo = process.env.CHECKOUT_REPO_NAME;
  if (!checkoutRepo) {
    throw Error("CHECK_REPO_NAME env is must set");
  }

  if (!existsSync(checkoutRepo)) {
    throw new Error(`${checkoutRepo} is not exist.`);
  }

  return join(getRepoPath(), checkoutRepo);
};