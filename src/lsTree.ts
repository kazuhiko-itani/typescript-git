import type { TreeParsedData } from "./domain";
import { BLOB_MODE, TREE_MODE } from "./domain";
import { decodeGitObjectFromHash } from "./helpers/parser";
import { isTreeObject } from "./helpers/typeChecker";

export const lsTree = async (
  hash: string,
  recursive: boolean
): Promise<void> => {
  const gitObject = await decodeGitObjectFromHash(hash);
  if (!isTreeObject(gitObject)) {
    throw Error(`${hash} is not tree object.`);
  }

  gitObject.content.forEach((data) => {
    if (data.mode === TREE_MODE && recursive) {
      lsTree(data.hash, recursive);
    }

    if (recursive) {
      displayDataOnlyBlob(data);
    } else {
      displayData(data);
    }
  });
};

const displayData = (data: TreeParsedData) => {
  // padding for format when tree
  const mode = data.mode === TREE_MODE ? "0" + TREE_MODE : BLOB_MODE;
  const type = data.mode === TREE_MODE ? "tree" : "blob";

  console.log(mode, type, data.hash, data.path);
};

const displayDataOnlyBlob = (data: TreeParsedData) => {
  if (data.mode === TREE_MODE) {
    return;
  }

  console.log(data.mode, "blob", data.hash, data.path);
};
