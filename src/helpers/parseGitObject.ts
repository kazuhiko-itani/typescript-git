import { unzip } from "zlib";

const SHA_LENGTH = 20;

type GitObjectType = "tree" | "blob" | "commit" | "tag";

type ParseGitObject = {
  type: GitObjectType;
  size: number;
  contentBinary: Buffer;
};

type ParsedData = {
  mode: string;
  path: string;
  hash: string;
};

export const parseGitObject = (gitObject: Buffer): Promise<ParseGitObject> => {
  return new Promise((resolve) => {
    unzip(gitObject, (_, buf) => {
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

      return resolve({ type, size, contentBinary });
    });
  });
};

export const treeParse = (content: Buffer): ParsedData[] => {
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
