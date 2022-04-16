export const SHA_LENGTH = 20;
export const TREE_MODE = "40000";
export const BLOB_MODE = "100644";

export type TreeParsedData = {
  mode: string;
  path: string;
  hash: string;
};

export type CommitLogKey =
  | "tree"
  | "parent"
  | "author"
  | "committer"
  | "gpgsig";

// commit message is less key
export type CommitLogDictKey = CommitLogKey | "";
export type CommitLogDict = Map<CommitLogDictKey, string[]>;

export type GitObjectType = "blob" | "commit" | "tree";
export type GitObject = BlobObject | CommitObject | TreeObject;

export type BlobObject = {
  type: "blob";
  size: number;
  content: string;
};

export type CommitObject = {
  type: "commit";
  size: number;
  content: CommitLogDict;
};

export type TreeObject = {
  type: "tree";
  size: number;
  content: TreeParsedData[];
};
