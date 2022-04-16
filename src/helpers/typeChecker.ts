import type { BlobObject, CommitObject, TreeObject } from "../domain";
import { GitObject } from "../domain";

export const isBlobObject = (gitObject: GitObject): gitObject is BlobObject => {
  return gitObject.type === "blob";
};

export const isCommitObject = (
  gitObject: GitObject
): gitObject is CommitObject => {
  return gitObject.type === "commit";
};

export const isTreeObject = (gitObject: GitObject): gitObject is TreeObject => {
  return gitObject.type === "tree";
};
