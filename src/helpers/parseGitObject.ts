import { unzip } from "zlib";

type GitObjectType = "tree" | "blob" | "commit" | "tag";

type ParseGitObject = {
  type: GitObjectType;
  size: number;
  contentBinary: Buffer;
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
