import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { parseGitObject, treeParse } from "./helpers/parseGitObject";
import { getCheckoutRepo, getGitObjectPath } from "./helpers/pathHelpers";

const TREE_MODE = "40000";
const BLOB_MODE = "100644";

export const checkout = async (commitHash: string): Promise<void> => {
  // 安全面を考慮して、対象のディレクトリが空の場合にのみコードをチェックアウトする
  if (readdirSync(getCheckoutRepo()).length !== 0) {
    console.log("The target directory must be empty to perform the checkout.");
    return;
  }

  const gitObjectPath = getGitObjectPath(commitHash);
  if (!existsSync(gitObjectPath)) {
    throw Error(`${commitHash} is not exist.`);
  }

  const fileContent = readFileSync(gitObjectPath);
  const gitObjectInfo = await parseGitObject(fileContent);
  if (gitObjectInfo.type !== "commit") {
    throw new Error(`${commitHash} is not commit object.`);
  }

  const commitLog = new TextDecoder().decode(gitObjectInfo.contentBinary);
  const treeHash = getTreeHash(commitLog);
  execCheckout(treeHash);
};

const getTreeHash = (commitLog: string): string => {
  const start = commitLog.indexOf("tree ");
  if (start === -1) {
    throw Error(`${commitLog} is invalid format.`);
  }

  const space = commitLog.indexOf(" ", start);
  const nlChar = commitLog.indexOf("\n", space);
  return commitLog.slice(space + 1, nlChar);
};

const execCheckout = async (treeHash: string, path = ".") => {
  const gitObjectPath = getGitObjectPath(treeHash);
  if (!existsSync(gitObjectPath)) {
    throw Error(`${treeHash} is not exist.`);
  }

  const fileContent = readFileSync(gitObjectPath);
  const gitObjectInfo = await parseGitObject(fileContent);
  if (gitObjectInfo.type !== "tree") {
    throw new Error(`${treeHash} is not tree object.`);
  }

  treeParse(gitObjectInfo.contentBinary).forEach(async (data) => {
    if (data.mode === TREE_MODE) {
      mkdirSync(resolve(getCheckoutRepo(), path, data.path));
      execCheckout(data.hash, join(path, data.path));
    } else if (data.mode === BLOB_MODE) {
      const objectPath = getGitObjectPath(data.hash);
      const blobContent = readFileSync(objectPath);
      const objectInfo = await parseGitObject(blobContent);

      if (objectInfo.type !== "blob") {
        throw new Error(
          `${data.hash} is not blob object. ${treeHash} contain invalid data.`
        );
      }

      const content = new TextDecoder().decode(objectInfo.contentBinary);
      writeFileSync(resolve(getCheckoutRepo(), path, data.path), content);
    }
  });
};
