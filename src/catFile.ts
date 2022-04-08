import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { TextDecoder } from "util";
import { unzip } from "zlib";
import { getGitPath } from "./helpers";

export type CatFileOption = "type" | "size" | "prettyPrint";
export type FileType = "blob" | "tree" | "commit" | "tag";

export const catFile = (hash: string, option: CatFileOption): Promise<void> => {
  const dirName = hash.slice(0, 2);
  const fileName = hash.slice(2);
  const gitPath = getGitPath();

  const filePath = resolve(gitPath, "objects", dirName, fileName);
  if (!existsSync(filePath)) {
    throw Error(`${filePath} is not exist`);
  }

  const fileContent = readFileSync(filePath);

  // テストのためにawaitできる形式にしたけど、効率面でよくなさそう
  // コマンドライン実行プログラムだからあまり影響はない？

  return new Promise<void>((resolve) => {
    unzip(fileContent, (_, buf) => {
      // object type
      const spaceIndex = buf.indexOf(" ");
      const typeBinary = buf.slice(0, spaceIndex);
      const type = new TextDecoder().decode(typeBinary) as FileType;

      // object size
      const nullIndex = buf.indexOf("\0");
      const fileSizeBinary = buf.slice(spaceIndex + 1, nullIndex);
      const fileSize = parseInt(new TextDecoder().decode(fileSizeBinary));

      // file content
      const contentBinary = buf.slice(nullIndex + 1);
      // treeの場合は16進数に変換する必要がある。 blobの場合はそのまま表示
      const content = new TextDecoder().decode(contentBinary);

      if (fileSize !== buf.length - nullIndex - 1) {
        throw Error(`Malformed object ${gitPath}: bad length`);
      }

      switch (type) {
        case "blob": {
          showBlobDetail({ type, fileSize, content }, option);
          break;
        }
        case "tree": {
          break;
        }
        case "commit": {
          break;
        }
        case "tag": {
          break;
        }
        default: {
          const strangeType: never = type;
          console.log(`${strangeType} is not allowed type`);
        }
      }

      resolve();
    });
  });
};

const showBlobDetail = (
  data: { type: FileType; fileSize: number; content: string },
  showOption: CatFileOption
): void => {
  switch (showOption) {
    case "type": {
      console.log(data.type);
      break;
    }
    case "size": {
      console.log(data.fileSize);
      break;
    }
    case "prettyPrint": {
      console.log(data.content);
      break;
    }
    default: {
      const strangeOption: never = showOption;
      console.log(`${strangeOption} is not allowed option`);
    }
  }
};
