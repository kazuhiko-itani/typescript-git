import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { gzip } from "zlib";
import { getGitObjectDirNameFromHash, getGitObjectPathFromHash } from "./path";

export const createBlobObject = (filePath: string): string => {
  const blobObjectData = getBlobObjectData(filePath);
  const gitObjectPath = getGitObjectPathFromHash(blobObjectData.sha);

  if (existsSync(gitObjectPath)) {
    return blobObjectData.sha;
  }

  if (!existsSync(getGitObjectDirNameFromHash(blobObjectData.sha))) {
    mkdirSync(getGitObjectDirNameFromHash(blobObjectData.sha));
  }

  gzip(blobObjectData.data, (_, buf) => {
    writeFileSync(gitObjectPath, buf);
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
