import ConfigParser from "configparser";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getGitRootPath } from "./helpers/path";

export const init = (): void => {
  const gitPath = getGitRootPath();
  if (existsSync(gitPath)) {
    throw Error(`${gitPath} is already exist`);
  }

  mkdirSync(gitPath);

  mkdirSync(join(gitPath, "branches"));
  mkdirSync(join(gitPath, "objects"));
  mkdirSync(join(gitPath, "refs", "tags"), { recursive: true });
  mkdirSync(join(gitPath, "refs", "heads"), { recursive: true });

  // .git/description
  const description =
    "Unnamed repository; edit this file 'description' to name the repository.\n";
  writeFileSync(join(gitPath, "description"), description);

  // .git/HEAD
  writeFileSync(join(gitPath, "HEAD"), "ref: refs/heads/master\n");

  // .git/config
  const config = new ConfigParser();
  config.addSection("core");
  config.set("core", "repositoryformatversion", 0);
  config.set("core", "filemode", true);
  config.set("core", "filemode", true);
  config.set("core", "precomposeunicode", true);
  writeFileSync(join(gitPath, "config"), "");
  config.write(join(gitPath, "config"));

  console.log("Create .tgit dir!");
};
