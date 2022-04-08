import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { gzip } from "zlib";
import type { FileType } from "../../src/catFile";
import { getTestGitDirPath } from "./setupGitDir";

// ヘルパー関数だけどこれはもうhash-fileコマンドを実装しているのと同じ...

export const createBlobObject = (data: {
  type: FileType;
  content: string;
}): Promise<string> => {
  const blobData = data.type + " " + data.content.length + "\0" + data.content;

  const sha = createHash("sha1").update(blobData).digest("hex");
  const dirName = sha.slice(0, 2);
  const fileName = sha.slice(2);

  return new Promise<string>((resolve) => {
    gzip(blobData, (_, buf) => {
      mkdirSync(getTestGitDirPath(["objects", dirName]));
      writeFileSync(getTestGitDirPath(["objects", dirName, fileName]), buf);

      resolve(sha);
    });
  });
};
