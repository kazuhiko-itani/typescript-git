import type { CommitLogDict } from "./domain";
import { decodeGitObjectFromHash } from "./helpers/parser";
import { isCommitObject } from "./helpers/typeChecker";

const commitHashes: string[] = [];
const seen: Set<string> = new Set();

export const log = (hash: string): void => {
  commitHashes.push(hash);
  while (commitHashes.length !== 0) {
    displayLog();
  }
};

const displayLog = async () => {
  const hash = commitHashes.shift();
  if (!hash) {
    return;
  }

  const gitObject = await decodeGitObjectFromHash(hash);
  if (!isCommitObject(gitObject)) {
    throw new Error(`${hash} is not commit object`);
  }
  displayData(hash, gitObject.content);

  const parentCommitHashes = gitObject.content.get("parent");
  if (parentCommitHashes) {
    parentCommitHashes
      .reverse()
      .filter((commitHash) => {
        return !seen.has(commitHash);
      })
      .forEach((commitHash) => {
        commitHashes.push(commitHash);
        seen.add(commitHash);
      });
  }

  displayLog();
};

const displayData = (commitHash: string, commitLogDict: CommitLogDict) => {
  console.log("\x1b[32mcommit " + commitHash + "\x1b[0m");
  commitLogDict.forEach((values, key) => {
    values.forEach((value) => {
      console.log(key, value);
    });
  });
  console.log("\n");
};
