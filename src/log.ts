import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { unzip } from "zlib";
import { getGitPath } from "./helpers";

type CommitLogKey = "tree" | "parent" | "author" | "committer" | "gpgsig";
// commit message is less key
type CommitLogDictKey = CommitLogKey | "";

export const log = (hash: string): void => {
  displayLog(hash);
};

const displayLog = (hash: string, seen: Set<string> = new Set()) => {
  const dirName = hash.slice(0, 2);
  const fileName = hash.slice(2);

  const absolutePath = join(getGitPath(), "objects", dirName, fileName);
  if (!existsSync(absolutePath)) {
    throw Error(`${hash} is not exist.`);
  }

  const fileContent = readFileSync(absolutePath);

  unzip(fileContent, (_, buf) => {
    // object type
    const spaceIndex = buf.indexOf(" ");
    const typeBinary = buf.slice(0, spaceIndex);
    const type = new TextDecoder().decode(typeBinary);
    if (type !== "commit") {
      throw new Error(`${hash} is not commit object`);
    }

    const nullIndex = buf.indexOf("\0");
    // commit info
    const commitInfoBinary = buf.slice(nullIndex + 1);
    const content = new TextDecoder().decode(commitInfoBinary);

    const parseResult = parseCommitLog(content, 0, new Map());
    parseResult.forEach((values, key) => {
      const valueString = values.reduce((a, b) => {
        return a + "\n       " + b;
      });

      console.log(key, valueString);
    });

    console.log("\n");

    const parentHashes = parseResult.get("parent");
    if (parentHashes) {
      parentHashes
        .filter((parentHash) => {
          return !seen.has(parentHash);
        })
        .forEach((parentHash) => {
          seen.add(parentHash);
          displayLog(parentHash, seen);
        });
    }
  });
};

const parseCommitLog = (
  commitLog: string,
  start: number,
  dict: Map<CommitLogDictKey, string[]>
): Map<CommitLogDictKey, string[]> => {
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

  return parseCommitLog(commitLog, start, dict);
};
