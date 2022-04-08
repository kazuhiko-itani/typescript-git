import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from "fs";
import { join, resolve } from "path";

export const getTestGitDirPath = (paths: string[] = []): string => {
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env must set");
  }

  return resolve(__dirname, "..", "..", gitDirName, ...paths);
};

export const createTestGitDir = (): void => {
  const gitPath = getTestGitDirPath();

  mkdirSync(gitPath);
  mkdirSync(join(gitPath, "objects"));
};

export const deleteTestGitDir = (targetPath = getTestGitDirPath()): void => {
  if (!existsSync(targetPath)) {
    return;
  }

  const items = readdirSync(targetPath);
  for (const item of items) {
    const deleteTarget = join(targetPath, item);
    if (lstatSync(deleteTarget).isDirectory()) {
      deleteTestGitDir(deleteTarget);
    } else {
      unlinkSync(deleteTarget);
    }
  }
  rmdirSync(targetPath);
};
