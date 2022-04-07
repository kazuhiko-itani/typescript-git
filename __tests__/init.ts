import fs from "fs";
import path from "path";
import { init } from "../src/init";
import { deleteTestGitDir, getTestGitDirPath } from "./test_helpers/helpers";

afterEach(() => {
  deleteTestGitDir();
});

test("should create new git dir", () => {
  const gitPath = getTestGitDirPath();

  init();

  expect(fs.existsSync(path.join(gitPath, "branches"))).toBe(true);
  expect(fs.existsSync(path.join(gitPath, "objects"))).toBe(true);
  expect(fs.existsSync(path.join(gitPath, "refs", "tags"))).toBe(true);
  expect(fs.existsSync(path.join(gitPath, "refs", "heads"))).toBe(true);

  expect(fs.existsSync(path.join(gitPath, "description"))).toBe(true);
  expect(fs.existsSync(path.join(gitPath, "HEAD"))).toBe(true);
  expect(fs.existsSync(path.join(gitPath, "config"))).toBe(true);
});

test("should raise error when git directory is already exists", () => {
  const gitPath = getTestGitDirPath();

  fs.mkdirSync(gitPath);

  expect(() => {
    init();
  }).toThrow();
});
