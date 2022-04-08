import { Command } from "commander";
import dotenv from "dotenv";
import type { CatFileOption } from "./catFile";
import { catFile } from "./catFile";
import { init } from "./init";

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

program.parse();
