import { expect, test } from "bun:test";
import { findCursorRules } from "../lib/cursorRules";
import { joinPath, toPosixPath } from "./helpers";

const fixtureRoot = joinPath(process.cwd(), "src/tests/fixtures/repo-a");
const rulesDir = joinPath(fixtureRoot, ".cursor/rules");

test("finds nested .md and .mdc files with stable ordering", async () => {
  const results = await findCursorRules(rulesDir);
  const normalized = results.map((path) => toPosixPath(path));

  const expected = [
    joinPath(rulesDir, "alpha.md"),
    joinPath(rulesDir, "nested/beta.mdc"),
  ].map((path) => toPosixPath(path));

  expect(normalized).toEqual(expected);
});
