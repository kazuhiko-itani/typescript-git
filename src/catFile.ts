import type { GitObjectType } from "./domain";
import { decodeGitObjectFromHash } from "./helpers/parser";

export type CatFileOption = "type" | "size" | "prettyPrint";

export const catFile = async (
  hash: string,
  option: CatFileOption
): Promise<void> => {
  const gitObject = await decodeGitObjectFromHash(hash);

  switch (gitObject.type) {
    case "blob": {
      showBlobDetail(
        {
          type: gitObject.type,
          fileSize: gitObject.size,
          content: gitObject.content,
        },
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
    default: {
      const undefinedValue: never = gitObject;
      console.log(`${undefinedValue} is invalid git object.`);
    }
  }
};

const showBlobDetail = (
  data: { type: GitObjectType; fileSize: number; content: string },
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
