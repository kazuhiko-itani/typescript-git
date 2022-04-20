import { lstatSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { GitIndexEntryDict } from "./domain";
import { createBlobObject } from "./helpers/blob";
import { getCheckoutRepoRootPath, getGitRootPath } from "./helpers/path";

const GIT_INDEX_SIGNATURE = "DIRC";
const GIT_INDEX_VERSION = 2;

// TODO .git_ignoreから読みこむようにする
const IGNORE_FILES_AND_DIRS = [
  ".git",
  "node_modules",
  "coverage",
  "yarn-error.log",
];

export const add = (): void => {
  const entries = createEntries();
  const entryBuffers: Buffer[] = [];

  entries.forEach((entry) => {
    const buffers: Buffer[] = [];

    entry.forEach((value, key) => {
      if (key === "filePath") {
        buffers.push(Buffer.from(value, "ascii"));
      } else {
        buffers.push(Buffer.from(value, "hex"));
      }
    });

    const buffer = Buffer.concat([...buffers]);
    const padding = calculatePadding(buffer.length);
    const bufferAfterPadding = Buffer.concat([
      buffer,
      Buffer.from("0".repeat(padding), "hex"),
    ]);
    entryBuffers.push(bufferAfterPadding);
  });

  const indexBody = Buffer.concat([...entryBuffers]);
  const indexHeader = createHeader(entries.length);
  const indexData = Buffer.concat([indexHeader, indexBody]);

  const indexFilePath = join(getGitRootPath(), "index");
  writeFileSync(indexFilePath, indexData);
};

const createHeader = (entryCount: number) => {
  const signature = Buffer.from(GIT_INDEX_SIGNATURE);
  const version = Buffer.from(
    alignLength(GIT_INDEX_VERSION.toString(16), 8),
    "hex"
  );
  const count = Buffer.from(alignLength(entryCount.toString(16), 8), "hex");

  return Buffer.concat([signature, version, count]);
};

const createEntries = (
  path = getCheckoutRepoRootPath(),
  entries: GitIndexEntryDict[] = []
) => {
  const items = readdirSync(path);
  for (const item of items) {
    if (IGNORE_FILES_AND_DIRS.includes(item)) {
      continue;
    }

    const itemPath = join(path, item);
    if (lstatSync(itemPath).isDirectory()) {
      createEntries(itemPath, entries);
    } else {
      entries.push(createEntry(itemPath));
    }
  }

  return entries;
};

const createEntry = (filePath: string) => {
  const fileMeta = lstatSync(filePath, { bigint: true });
  const dict: GitIndexEntryDict = new Map();

  // ctime
  const ctimeNanosecond = fileMeta.ctimeNs;
  dict.set(
    "ctimeSecond",
    alignLength(
      parseInt(ctimeNanosecond.toString().slice(0, 10)).toString(16),
      8
    )
  );

  // ctime nanosecond
  dict.set(
    "ctimeNanosecond",
    alignLength(parseInt(ctimeNanosecond.toString().slice(10)).toString(16), 8)
  );

  // mtime
  const mtimeNanosecond = fileMeta.mtimeNs;
  dict.set(
    "mtimeSecond",
    alignLength(
      parseInt(mtimeNanosecond.toString().slice(0, 10)).toString(16),
      8
    )
  );

  // mtime nanosecond
  dict.set(
    "mtimeNanosecond",
    alignLength(parseInt(mtimeNanosecond.toString().slice(10)).toString(16), 8)
  );

  // dev
  const dev = fileMeta.dev;
  dict.set("dev", alignLength(dev.toString(16), 8));

  // ino
  const ino = fileMeta.ino;
  dict.set("ino", alignLength(ino.toString(16), 8));

  // mode
  const mode = fileMeta.mode;
  dict.set("mode", alignLength(mode.toString(16), 8));

  // uid
  const uid = fileMeta.uid;
  dict.set("uid", alignLength(uid.toString(16), 8));

  // gid
  const gid = fileMeta.gid;
  dict.set("gid", alignLength(gid.toString(16), 8));

  // size
  const size = fileMeta.size;
  dict.set("size", alignLength(size.toString(16), 8));

  // create git object and get sha
  const sha = createBlobObject(filePath);
  dict.set("sha", sha);

  const filePathInRepo = filePath.replace(`${getCheckoutRepoRootPath()}/`, "");

  // filePathLength
  dict.set(
    "filePathLength",
    alignLength(filePathInRepo.length.toString(16), 4)
  );

  // filePath
  dict.set("filePath", filePath.replace(`${getCheckoutRepoRootPath()}/`, ""));

  return dict;
};

const alignLength = (hex: string, length: number): string => {
  if (hex.length < length) {
    return hex.padStart(length, "0");
  } else if (hex.length > length) {
    return hex.slice(-length);
  } else {
    return hex;
  }
};

const calculatePadding = (entrySize: number) => {
  const diff = entrySize % 8;
  return (8 - diff) * 2;
};
