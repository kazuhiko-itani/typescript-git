import { existsSync, readFileSync } from "fs";
import { TextDecoder } from "util";
import { parseGitObject } from "./helpers/parseGitObject";
import { getGitObjectPath } from "./helpers/pathHelpers";

export type CatFileOption = "type" | "size" | "prettyPrint";
export type FileType = "blob" | "tree" | "commit" | "tag";

export const catFile = async (
  hash: string,
  option: CatFileOption
): Promise<void> => {
  const gitObjectPath = getGitObjectPath(hash);
  if (!existsSync(gitObjectPath)) {
    throw Error(`${gitObjectPath} is not exist`);
  }

  const fileContent = readFileSync(gitObjectPath);
  const gitObjectInfo = await parseGitObject(fileContent);
  const content = new TextDecoder().decode(gitObjectInfo.contentBinary);

  switch (gitObjectInfo.type) {
    case "blob": {
      showBlobDetail(
        { type: gitObjectInfo.type, fileSize: gitObjectInfo.size, content },
        option
      );
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
      const strangeType: never = gitObjectInfo.type;
      console.log(`${strangeType} is not allowed type`);
    }
  }
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
