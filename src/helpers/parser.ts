import { existsSync, readFileSync } from "fs";
import { unzip } from "zlib";
import type {
  BlobObject,
  CommitLogDict,
  CommitLogKey,
  CommitObject,
  GitIndexEntryDict,
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

type IndexParser = {
  header: {
    signature: string;
    version: string;
    count: string;
  };
  entries: GitIndexEntryDict[];
};

export const indexParser = (buffer: Buffer): IndexParser => {
  // header
  const signature = new TextDecoder().decode(buffer.slice(0, 4));
  const version = buffer.slice(4, 8).toString("hex");
  const count = buffer.slice(8, 12).toString("hex");

  // entries
  let currentPos = 12;
  const entries: GitIndexEntryDict[] = [];

  for (let i = 0; i < parseInt(count, 16); i++) {
    const entryStart = currentPos;
    const dict: GitIndexEntryDict = new Map();

    dict.set(
      "ctimeSecond",
      buffer.slice(currentPos, currentPos + 4).toString("hex")
    );
    currentPos += 4;

    dict.set(
      "ctimeNanosecond",
      buffer.slice(currentPos, currentPos + 4).toString("hex")
    );
    currentPos += 4;

    dict.set(
      "mtimeSecond",
      buffer.slice(currentPos, currentPos + 4).toString("hex")
    );
    currentPos += 4;

    dict.set(
      "mtimeNanosecond",
      buffer.slice(currentPos, currentPos + 4).toString("hex")
    );
    currentPos += 4;

    dict.set("dev", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("ino", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("mode", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("uid", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("gid", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("size", buffer.slice(currentPos, currentPos + 4).toString("hex"));
    currentPos += 4;

    dict.set("sha", buffer.slice(currentPos, currentPos + 20).toString("hex"));
    currentPos += 20;

    const filePathLength = buffer
      .slice(currentPos, currentPos + 2)
      .toString("hex");

    dict.set("filePathLength", filePathLength);
    currentPos += 2;

    dict.set(
      "filePath",
      buffer
        .slice(currentPos, currentPos + parseInt(filePathLength, 16))
        .toString("ascii")
    );
    currentPos += parseInt(filePathLength, 16);
    currentPos += calculatePadding(currentPos - entryStart);

    entries.push(dict);
  }

  return {
    header: {
      signature,
      version,
      count,
    },
    entries,
  };
};

// 1-8 nul bytes as necessary to pad the entry to a multiple of eight bytes while keeping the name NUL-terminated.
const calculatePadding = (entrySize: number) => {
  const diff = entrySize % 8;
  return 8 - diff;
};
