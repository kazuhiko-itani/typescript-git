import { catFile } from "../src/catFile";
import { createBlobObject } from "./test_helpers/object";
import { createTestGitDir, deleteTestGitDir } from "./test_helpers/setupGitDir";

beforeEach(() => {
  createTestGitDir();
});

afterEach(() => {
  deleteTestGitDir();
  jest.clearAllMocks();
});

test("should show object type when file is blob object and option is 'type'", async () => {
  const hash = await createBlobObject({
    type: "blob",
    content: "Test Text",
  });

  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  await catFile(hash, "type");

  expect(consoleLogSpy.mock.calls[0][0]).toBe("blob");
});

test("should show content size when file is blob object and option is 'size'", async () => {
  const content = "Test Text";
  const hash = await createBlobObject({
    type: "blob",
    content,
  });

  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  await catFile(hash, "size");

  expect(consoleLogSpy.mock.calls[0][0]).toBe(content.length);
});

test("should show content when file is blob object and option is 'prettyPrint'", async () => {
  const content = "Test Text";
  const hash = await createBlobObject({
    type: "blob",
    content,
  });

  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  await catFile(hash, "prettyPrint");

  expect(consoleLogSpy.mock.calls[0][0]).toBe(content);
});
