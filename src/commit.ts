import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { gzip } from "zlib";
import { GitIndexEntryDict, TREE_MODE } from "./domain";
import { indexParser } from "./helpers/parser";
import {
  getGitObjectDirNameFromHash,
  getGitObjectPathFromHash,
  getGitRootPath,
} from "./helpers/path";
import { refResolve, updateRef } from "./helpers/ref";

type Blob = {
  type: "blob";
  mode: string;
  path: string;
  sha: string;
};

type Tree = {
  type: "tree";
  mode: string;
  path: string;
  leafs: Map<string, Blob | Tree>;
};

export const commit = async (commitMessage: string): Promise<void> => {
  const gitIndexRaw = readFileSync(join(getGitRootPath(), "index"));
  const gitIndex = indexParser(gitIndexRaw);
  const tree = createTreeStruct(gitIndex.entries);
  const rootTreeSha = await createGitTreeObject(tree.leafs);

  const parentCommit = refResolve(join(getGitRootPath(), "HEAD"));
  // when first commit, parent commit is none.
  const parentCommitMessage = parentCommit ? `parent ${parentCommit}` : "";
  const author = "";

  const commitContent = `tree ${rootTreeSha}
${parentCommitMessage}
author ${author}

${commitMessage}
`;

  const commitData =
    "commit" + " " + commitContent.length + "\0" + commitContent;
  const sha = createHash("sha1").update(commitData).digest("hex");
  const gitObjectPath = getGitObjectPathFromHash(sha);

  if (existsSync(gitObjectPath)) {
    return;
  }

  if (!existsSync(getGitObjectDirNameFromHash(sha))) {
    mkdirSync(getGitObjectDirNameFromHash(sha));
  }

  gzip(commitData, (_, buf) => {
    writeFileSync(gitObjectPath, buf);
    updateRef(sha);
  });
};

const createTreeStruct = (gitIndexDict: GitIndexEntryDict[]) => {
  const root: Tree = {
    type: "tree",
    mode: TREE_MODE,
    path: ".",
    leafs: new Map(),
  };

  gitIndexDict.forEach((entry) => {
    let path = entry.get("filePath");
    if (!path) {
      throw Error("git index is invalid format.");
    }

    let currentMap = root;

    while (path.includes("/")) {
      const index = path.indexOf("/");
      const dirName = path.slice(0, index);
      if (!currentMap.leafs.has(dirName)) {
        currentMap.leafs.set(dirName, {
          type: "tree",
          mode: TREE_MODE,
          path: dirName,
          leafs: new Map(),
        });
      }

      currentMap = currentMap.leafs.get(dirName) as Tree;
      path = path.slice(index + 1);
    }

    const modeHex = entry.get("mode");
    const sha = entry.get("sha");
    if (!modeHex || !sha) {
      throw Error("git index is invalid format.");
    }

    const blob: Blob = {
      type: "blob",
      mode: parseInt(modeHex, 16).toString(8),
      path,
      sha,
    };
    currentMap.leafs.set(path, blob);
  });

  return root;
};

const createGitTreeObject = async (
  entries: Map<string, Blob | Tree>
): Promise<string> => {
  const contentBuffers: Buffer[] = [];
  let contents = "";

  for (const entry of entries.values()) {
    if (entry.type === "tree") {
      const treeSha = await createGitTreeObject(entry.leafs);
      contents += entry.mode + " " + entry.path + "\0" + treeSha;
      const contentBuffer = Buffer.concat([
        Buffer.from(`${entry.mode} ${entry.path}\0`),
        Buffer.from(treeSha, "hex"),
      ]);
      contentBuffers.push(contentBuffer);
    } else if (entry.type === "blob") {
      contents += entry.mode + " " + entry.path + "\0" + entry.sha;

      const contentBuffer = Buffer.concat([
        Buffer.from(`${entry.mode} ${entry.path}\0`),
        Buffer.from(entry.sha, "hex"),
      ]);
      contentBuffers.push(contentBuffer);
    }
  }
  const treeObject = Buffer.concat([
    Buffer.from(`tree ${contents.length.toString()}\0`),
    ...contentBuffers,
  ]);

  const sha = createHash("sha1").update(treeObject).digest("hex");
  const gitObjectPath = getGitObjectPathFromHash(sha);

  if (gitObjectPath) {
    return sha;
  }

  if (!existsSync(getGitObjectDirNameFromHash(sha))) {
    mkdirSync(getGitObjectDirNameFromHash(sha));
  }

  return new Promise((resolve) => {
    gzip(treeObject, async (_, buf) => {
      writeFileSync(gitObjectPath, buf);

      resolve(sha);
    });
  });
};
