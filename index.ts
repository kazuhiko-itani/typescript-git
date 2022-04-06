import { program } from "commander";

program.command("init").action(() => {
  console.log("ok");
});

program.parse();
