import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { gzip } from "zlib";
import { getGitRootPath } from "./path";

export const createBlobObject = (filePath: string): string => {
  const blobObjectData = getBlobObjectData(filePath);

  const dirName = blobObjectData.sha.slice(0, 2);
  const fileName = blobObjectData.sha.slice(2);
  const dirPath = join(getGitRootPath(), "objects", dirName);

  if (existsSync(join(dirPath, fileName))) {
    return blobObjectData.sha;
  }

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }

  gzip(blobObjectData.data, (_, buf) => {
    writeFileSync(join(dirPath, fileName), buf);
  });

  return blobObjectData.sha;
};

export const getBlobObjectSha = (filePath: string): string => {
  return getBlobObjectData(filePath).sha;
};

const getBlobObjectData = (filePath: string) => {
  const fileContent = readFileSync(filePath);
  const blobData = "blob" + " " + fileContent.length + "\0" + fileContent;
  const sha = createHash("sha1").update(blobData).digest("hex");

  return { data: blobData, sha };
};
