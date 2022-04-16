import { resolve } from "path";
import {
  getGitObjectPath,
  getGitRootPath,
  getRepoRootPath,
} from "../../src/helpers/path";

test("should return the directory where git is located", () => {
  const expectPath = resolve(__dirname, "..", "..");

  expect(getRepoRootPath()).toBe(expectPath);
});

test("should return .tgit dir path", () => {
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env must set");
  }

  const expectPath = resolve(__dirname, "..", "..", gitDirName);

  expect(getGitRootPath()).toBe(expectPath);
});

test("should return git object path in .tgit dir", () => {
  const gitDirName = process.env.GIT_DIR_NAME;
  if (!gitDirName) {
    throw Error("GIT_DIR_NAME env must set");
  }

  const hash = "1234567890abcdefghij";
  const dirName = hash.slice(0, 2);
  const fileName = hash.slice(2);

  const expectPath = resolve(
    __dirname,
    "..",
    "..",
    gitDirName,
    "objects",
    dirName,
    fileName
  );

  expect(getGitObjectPath(hash)).toBe(expectPath);
});
