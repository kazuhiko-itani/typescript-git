import { existsSync, readFileSync } from "fs";
import { parseGitObject } from "./helpers/parseGitObject";
import { getGitObjectPath } from "./helpers/pathHelpers";

const TREE_MODE = "40000";
const BLOB_MODE = "100644";
const SHA_LENGTH = 20;

export const lsTree = async (
  hash: string,
  recursive: boolean
): Promise<void> => {
  const gitObjectPath = getGitObjectPath(hash);
  if (!existsSync(gitObjectPath)) {
    throw Error(`${hash} is not exist.`);
  }

  const fileContent = readFileSync(gitObjectPath);
  const gitObjectInfo = await parseGitObject(fileContent);
  if (gitObjectInfo.type !== "tree") {
    throw new Error(`${hash} is not tree object.`);
  }

  const parsedData = treeParse(gitObjectInfo.contentBinary);
  parsedData.forEach((data) => {
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

type ParsedData = {
  mode: string;
  path: string;
  hash: string;
};

const treeParse = (content: Buffer) => {
  let start = 0;
  const max = content.length;
  const parsedDataList: ParsedData[] = [];

  while (start < max) {
    const { end, data } = treeParseOne(content, start);
    start = end + 1;
    parsedDataList.push(data);
  }

  return parsedDataList;
};

const treeParseOne = (
  content: Buffer,
  start: number
): { end: number; data: ParsedData } => {
  const spaceIndex = content.indexOf(" ", start);
  const modeBinary = content.slice(start, spaceIndex);
  const mode = new TextDecoder().decode(modeBinary);

  const nullIndex = content.indexOf("\0", spaceIndex);
  const pathBinary = content.slice(spaceIndex + 1, nullIndex);
  const path = new TextDecoder().decode(pathBinary);

  const sha = content.slice(nullIndex + 1, nullIndex + SHA_LENGTH + 1);
  const hash = Buffer.from(sha).toString("hex");

  return { end: nullIndex + SHA_LENGTH, data: { mode, path, hash } };
};

const displayData = (data: ParsedData) => {
  // padding for format when tree
  const mode = data.mode === TREE_MODE ? "0" + TREE_MODE : BLOB_MODE;
  const type = data.mode === TREE_MODE ? "tree" : "blob";

  console.log(mode, type, data.hash, data.path);
};

const displayDataOnlyBlob = (data: ParsedData) => {
  if (data.mode === TREE_MODE) {
    return;
  }

  console.log(data.mode, "blob", data.hash, data.path);
};
