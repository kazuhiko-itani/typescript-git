import { program } from "commander";
import dotenv from "dotenv";
import { init } from "./init";

dotenv.config();

program.command("init").action(() => {
  init();
});

program.parse();
