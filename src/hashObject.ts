import { createHash } from "crypto";
import { existsSync, lstatSync, readFileSync } from "fs";
import { join } from "path";
import { getRepoPath } from "./helpers/path";

type HeaderType = "tree" | "blob";

export const hashObject = (filePath: string): void => {
  const absolutePath = join(getRepoPath(), filePath);
  if (!existsSync(absolutePath)) {
    throw Error(`${absolutePath} is not exist.`);
  }

  const type: HeaderType = lstatSync(absolutePath).isDirectory()
    ? "tree"
    : "blob";

  switch (type) {
    case "blob": {
      createBlobObject(absolutePath);
      break;
    }
    default: {
      console.log(type);
    }
  }
};

const createBlobObject = (filePath: string): void => {
  const fileContent = readFileSync(filePath);
  const blobData = "blob" + " " + fileContent.length + "\0" + fileContent;
  const sha = createHash("sha1").update(blobData).digest("hex");
  console.log(sha);
};
