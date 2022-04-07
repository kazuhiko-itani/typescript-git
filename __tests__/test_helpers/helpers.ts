import fs from "fs";
import path from "path";

export const getTestGitDirPath = (): string => {
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env must set");
  }

  return path.resolve(__dirname, "..", "..", gitDirName);
};

export const createTestGitDir = (): void => {
  fs.mkdirSync(getTestGitDirPath());
};

export const deleteTestGitDir = (targetPath = getTestGitDirPath()): void => {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const items = fs.readdirSync(targetPath);
  for (const item of items) {
    const deleteTarget = path.join(targetPath, item);
    if (fs.lstatSync(deleteTarget).isDirectory()) {
      deleteTestGitDir(deleteTarget);
    } else {
      fs.unlinkSync(deleteTarget);
    }
  }
  fs.rmdirSync(targetPath);
};
