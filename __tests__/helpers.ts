import path from "path";
import { getGitPath, getRepoPath } from "../src/helpers";

test("should return the directory where git is located", () => {
  const expectPath = path.resolve(__dirname, "..");

  expect(getRepoPath()).toBe(expectPath);
});

test("should return .tgit dir path", () => {
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env must set");
  }

  const expectPath = path.resolve(__dirname, "..", gitDirName);

  expect(getGitPath()).toBe(expectPath);
});
