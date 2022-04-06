import ConfigParser from "configparser";
import fs from "fs";
import path from "path";
import { getGitPath } from "./helpers";

export const init = (): void => {
  const gitPath = getGitPath();
  if (fs.existsSync(gitPath)) {
    throw Error(`${gitPath} is already exist`);
  }

  fs.mkdirSync(gitPath);

  fs.mkdirSync(path.join(gitPath, "branches"));
  fs.mkdirSync(path.join(gitPath, "objects"));
  fs.mkdirSync(path.join(gitPath, "refs", "tags"), { recursive: true });
  fs.mkdirSync(path.join(gitPath, "refs", "heads"), { recursive: true });

  // .git/description
  const description =
    "Unnamed repository; edit this file 'description' to name the repository.\n";
  fs.writeFileSync(path.join(gitPath, "description"), description);

  // .git/HEAD
  fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/master\n");

  // .git/config
  const config = new ConfigParser();
  config.addSection("core");
  config.set("core", "repositoryformatversion", 0);
  config.set("core", "filemode", true);
  config.set("core", "filemode", true);
  config.set("core", "precomposeunicode", true);
  fs.writeFileSync(path.join(gitPath, "config"), "");
  config.write(path.join(gitPath, "config"));

  console.log("Create .tgit dir!");
};
