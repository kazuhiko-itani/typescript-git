import { Command } from "commander";
import dotenv from "dotenv";
import { add } from "./add";
import { createBranch, showBranch } from "./branch";
import type { CatFileOption } from "./catFile";
import { catFile } from "./catFile";
import { checkout } from "./checkout";
import { hashObject } from "./hashObject";
import { init } from "./init";
import { log } from "./log";
import { lsTree } from "./lsTree";
import { showRef } from "./showRef";

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
  .action((hash: string, options: Partial<ShowTypeOption>) => {
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
  .action((filePath: string) => {
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
  .action((hash: string, options: { recursive: boolean }) => {
    lsTree(hash, options.recursive);
  });

program
  .command("checkout")
  .argument("<checkoutTo>")
  .action((checkoutTo: string) => {
    checkout(checkoutTo);
  });

program.command("show-ref").action(() => {
  showRef();
});

program
  .command("tag")
  .option("-a --isCreateObject", "Whether to create a tag object")
  .argument("[name]", "The new tag's name")
  .argument("[object]", "The object the new tag will point to")
  .action((name: string | undefined, object: string | undefined, options) => {
    if (!name) {
      showRef("tags");
      // TODO タグ作成処理の実装
    } else if (name && !object) {
      console.log(options);
    } else {
      console.log("ok");
    }
  });

program
  .command("branch")
  .option("-b --switch", "Whether to switch branch")
  .argument("[branchName]", "The new branch's name")
  .action((branchName: string | undefined, options: { switch?: boolean }) => {
    if (branchName) {
      createBranch(branchName, options.switch ?? false);
    } else {
      showBranch();
    }
  });

program.command("add").action(() => {
  add();
});

program.parse();
