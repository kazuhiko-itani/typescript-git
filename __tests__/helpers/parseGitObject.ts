import { gzip } from "zlib";
import { parseGitObject } from "../../src/helpers/parseGitObject";

const type = "blob";
const content = "Test Text";
const size = content.length;
const gitObjectDummy = type + " " + size + "\0" + content;

test("should correctly parse git objects", (done) => {
  gzip(gitObjectDummy, async (_, buf) => {
    const result = await parseGitObject(buf);

    expect(result.type).toBe(type);
    expect(result.size).toBe(size);

    done();
  });
});
