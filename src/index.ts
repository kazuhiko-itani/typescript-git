import { Command } from "commander";
import dotenv from "dotenv";
import type { CatFileOption } from "./catFile";
import { catFile } from "./catFile";
import { checkout } from "./checkout";
import { hashObject } from "./hashObject";
import { init } from "./init";
import { log } from "./log";
import { lsTree } from "./lsTree";

type ShowTypeOption = {
  [k in CatFileOption]: boolean;
};

dotenv.config();

const program = new Command();

program.command("init").action(() => {
  init();
});

program
  .command("cat-file")
  .option("-t --type")
  .option("-s --size")
  .option("-p --prettyPrint")
  .argument("<hash>", "file path")
  .action((hash, options: Partial<ShowTypeOption>) => {
    if (Object.values(options).length == 0) {
      console.log("show type option must need.");
      return;
    }

    if (Object.values(options).length > 1) {
      console.log("only one show type option can be specified");
      return;
    }

    catFile(hash, Object.keys(options)[0] as CatFileOption);
  });

program
  .command("hash-object")
  .argument("<filePath>")
  .action((filePath) => {
    hashObject(filePath);
  });

program
  .command("log")
  .argument("<hash>")
  .action((hash) => {
    log(hash);
  });

program
  .command("ls-tree")
  .option("-r --recursive")
  .argument("<hash>")
  .action((hash, options: { recursive: boolean }) => {
    lsTree(hash, options.recursive);
  });

program
  .command("checkout")
  .argument("<commitHash>")
  .action((commitHash) => {
    checkout(commitHash);
  });

program.parse();
