import { existsSync, readFileSync } from "fs";
import { unzip } from "zlib";
import type {
  BlobObject,
  CommitLogDict,
  CommitLogKey,
  CommitObject,
  GitObjectType,
  TreeObject,
  TreeParsedData,
} from "../domain";
import { SHA_LENGTH } from "../domain";
import { getGitObjectPath } from "./path";

export const decodeGitObjectFromHash = (
  hash: string
): Promise<BlobObject | CommitObject | TreeObject> => {
  const objectPath = getGitObjectPath(hash);

  if (!existsSync(objectPath)) {
    throw Error(`${hash} is not exist.`);
  }

  const content = readFileSync(objectPath);

  return new Promise((resolve) => {
    unzip(content, (_, buf) => {
      // object type
      const spaceIndex = buf.indexOf(" ");
      const typeBinary = buf.slice(0, spaceIndex);
      const type = new TextDecoder().decode(typeBinary) as GitObjectType;

      // object size
      const nullIndex = buf.indexOf("\0");
      const sizeBinary = buf.slice(spaceIndex + 1, nullIndex);
      const size = parseInt(new TextDecoder().decode(sizeBinary));

      // file content
      const contentBinary = buf.slice(nullIndex + 1);

      switch (type) {
        case "blob": {
          resolve({
            type,
            size,
            content: new TextDecoder().decode(contentBinary),
          });
          break;
        }
        case "commit": {
          resolve({
            type,
            size,
            content: parseCommit(new TextDecoder().decode(contentBinary)),
          });
          break;
        }
        case "tree": {
          resolve({
            type: "tree",
            size,
            content: treeParse(contentBinary),
          });
          break;
        }
        default: {
          const undefinedValue: never = type;
          throw Error(`${undefinedValue} is invalid git object type`);
        }
      }
    });
  });
};

export const treeParse = (content: Buffer): TreeParsedData[] => {
  let start = 0;
  const max = content.length;
  const parsedDataList: TreeParsedData[] = [];

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
): { end: number; data: TreeParsedData } => {
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

export const parseCommitLog = (commitLog: string): CommitLogDict => {
  return parseCommit(commitLog);
};

const parseCommit = (
  commitLog: string,
  start = 0,
  dict: CommitLogDict = new Map()
): CommitLogDict => {
  const space = commitLog.indexOf(" ", start);
  const nlChar = commitLog.indexOf("\n", start);

  // If a newline-only line appears after gpgsig, the remainder is the commit message
  if (space === -1 || nlChar < space) {
    dict.set("", [commitLog.slice(start)]);
    return dict;
  }

  const key = commitLog.slice(start, space) as CommitLogKey;
  if (key === "gpgsig") {
    const GPGSIG_END = "-----END PGP SIGNATURE-----";
    const gpgsigValueEnd = commitLog.indexOf(GPGSIG_END) + GPGSIG_END.length;
    dict.set(key, [commitLog.slice(space + 1, gpgsigValueEnd)]);
    start = gpgsigValueEnd + 1;
  } else {
    const values = dict.get(key) ?? [];
    dict.set(key, [...values, commitLog.slice(space + 1, nlChar)]);
    start = nlChar + 1;
  }

  return parseCommit(commitLog, start, dict);
};
