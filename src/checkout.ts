import { mkdirSync, readdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { BLOB_MODE, TREE_MODE } from "./domain";
import { decodeGitObjectFromHash } from "./helpers/parser";
import { getCheckoutRepo } from "./helpers/path";
import {
  isBlobObject,
  isCommitObject,
  isTreeObject,
} from "./helpers/typeChecker";

export const checkout = async (commitHash: string): Promise<void> => {
  // 安全面を考慮して、対象のディレクトリが空の場合にのみコードをチェックアウトする
  if (readdirSync(getCheckoutRepo()).length !== 0) {
    console.log("The target directory must be empty to perform the checkout.");
    return;
  }

  const gitObject = await decodeGitObjectFromHash(commitHash);
  if (!isCommitObject(gitObject)) {
    throw new Error(`${commitHash} is not commit object.`);
  }

  const treeHash = gitObject.content.get("tree");
  if (!treeHash || treeHash.length === 0) {
    throw Error(`${commitHash} is invalid commit data.`);
  }

  execCheckout(treeHash[0]);
  console.log(`done checkout ${commitHash}`);
};

const execCheckout = async (treeHash: string, path = ".") => {
  const gitObject = await decodeGitObjectFromHash(treeHash);
  if (!isTreeObject(gitObject)) {
    throw new Error(`${treeHash} is not tree object.`);
  }

  gitObject.content.forEach(async (data) => {
    if (data.mode === TREE_MODE) {
      mkdirSync(resolve(getCheckoutRepo(), path, data.path));
      execCheckout(data.hash, join(path, data.path));
    } else if (data.mode === BLOB_MODE) {
      const blobObjectData = await decodeGitObjectFromHash(data.hash);

      if (!isBlobObject(blobObjectData)) {
        throw new Error(
          `${data.hash} is not blob object. ${treeHash} contain invalid data.`
        );
      }

      writeFileSync(
        resolve(getCheckoutRepo(), path, data.path),
        blobObjectData.content
      );
    }
  });
};
