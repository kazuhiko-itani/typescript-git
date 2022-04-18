import { existsSync, lstatSync } from "fs";
import { join } from "path";
import { getBlobObjectSha } from "./helpers/blob";
import { getRepoRootPath } from "./helpers/path";

type HeaderType = "tree" | "blob";

export const hashObject = (filePath: string): void => {
  const absolutePath = join(getRepoRootPath(), filePath);
  if (!existsSync(absolutePath)) {
    throw Error(`${absolutePath} is not exist.`);
  }

  const type: HeaderType = lstatSync(absolutePath).isDirectory()
    ? "tree"
    : "blob";

  switch (type) {
    case "blob": {
      const sha = getBlobObjectSha(absolutePath);
      console.log(sha);
      break;
    }
    default: {
      console.log(type);
    }
  }
};
