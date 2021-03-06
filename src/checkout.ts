import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { BLOB_MODE, TREE_MODE } from "./domain";
import { decodeGitObjectFromHash } from "./helpers/parser";
import {
  getCheckoutRepoRootPath,
  getGitRootPath,
  getRefRootPath,
} from "./helpers/path";
import { refResolve } from "./helpers/ref";
import {
  isBlobObject,
  isCommitObject,
  isTreeObject,
} from "./helpers/typeChecker";

export const checkout = (checkoutTo: string): void => {
  const path = join(getRefRootPath(), "heads", checkoutTo);

  // if true, checkoutTo is branch name
  // if false, checkoutTo is hash string
  if (existsSync(path)) {
    const commitHash = refResolve(path);
    execCheckout(commitHash);
    writeFileSync(
      join(getGitRootPath(), "HEAD"),
      `ref: refs/heads/${checkoutTo}`
    );
  } else {
    execCheckout(checkoutTo);
    writeFileSync(join(getGitRootPath(), "HEAD"), checkoutTo);
  }

  console.log(`done checkout ${checkoutTo}`);
};

const execCheckout = async (hash: string): Promise<void> => {
  const gitObject = await decodeGitObjectFromHash(hash);
  if (!isCommitObject(gitObject)) {
    throw Error(`${hash} is not commit object.`);
  }

  const treeHash = gitObject.content.get("tree");
  if (!treeHash || treeHash.length === 0) {
    throw Error(`${hash} is invalid data.`);
  }

  // チェックアウトの途中で失敗した場合、以前のコードベースを復旧できないが、
  // 実装の単純化のために許容する。（復旧機能を実装するとしたら、変更前のHEADを記憶しておけば良い？）
  cleanCheckoutRepo();
  treeCheckout(treeHash[0]);
};

const treeCheckout = async (treeHash: string, path = ".") => {
  const gitObject = await decodeGitObjectFromHash(treeHash);
  if (!isTreeObject(gitObject)) {
    throw Error(`${treeHash} is not tree object.`);
  }

  gitObject.content.forEach(async (data) => {
    if (data.mode === TREE_MODE) {
      mkdirSync(resolve(getCheckoutRepoRootPath(), path, data.path));
      treeCheckout(data.hash, join(path, data.path));
    } else if (data.mode === BLOB_MODE) {
      const blobObjectData = await decodeGitObjectFromHash(data.hash);

      if (!isBlobObject(blobObjectData)) {
        throw Error(
          `${data.hash} is not blob object. ${treeHash} contain invalid data.`
        );
      }

      writeFileSync(
        resolve(getCheckoutRepoRootPath(), path, data.path),
        blobObjectData.content
      );
    }
  });
};

export const cleanCheckoutRepo = (path = getCheckoutRepoRootPath()): void => {
  if (path === getGitRootPath()) {
    return;
  }

  const items = readdirSync(path);
  for (const item of items) {
    const itemPath = join(path, item);
    if (lstatSync(itemPath).isDirectory()) {
      cleanCheckoutRepo(itemPath);
    } else {
      unlinkSync(itemPath);
    }
  }

  if (path !== getCheckoutRepoRootPath()) {
    rmdirSync(path);
  }
};
