import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { init } from "../src/init";
import {
  deleteTestGitDir,
  getTestGitDirPath,
} from "./test_helpers/setupGitDir";

afterEach(() => {
  deleteTestGitDir();
});

test("should create new git dir", () => {
  const gitPath = getTestGitDirPath();

  init();

  expect(existsSync(join(gitPath, "branches"))).toBe(true);
  expect(existsSync(join(gitPath, "objects"))).toBe(true);
  expect(existsSync(join(gitPath, "refs", "tags"))).toBe(true);
  expect(existsSync(join(gitPath, "refs", "heads"))).toBe(true);

  expect(existsSync(join(gitPath, "description"))).toBe(true);
  expect(existsSync(join(gitPath, "HEAD"))).toBe(true);
  expect(existsSync(join(gitPath, "config"))).toBe(true);
});

test("should raise error when git directory is already exists", () => {
  const gitPath = getTestGitDirPath();

  mkdirSync(gitPath);

  expect(() => {
    init();
  }).toThrow();
});
