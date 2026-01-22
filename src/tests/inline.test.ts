import { expect, test } from "bun:test";
import {
  generateInlineContent,
  loadRuleFiles,
} from "../lib/cursorRules";
import { joinPath, relativePath, toPosixPath } from "./helpers";

const fixtureRoot = joinPath(process.cwd(), "src/tests/fixtures/repo-a");
const rulesDir = joinPath(fixtureRoot, ".cursor/rules");
const cwd = toPosixPath(process.cwd());

test("inline mode expands globs and demotes H1 outside code fences", async () => {
  const rules = await loadRuleFiles(rulesDir);
  const output = generateInlineContent(rules);

  const alphaAbs = joinPath(rulesDir, "alpha.md");
  const alphaRel = relativePath(cwd, alphaAbs);

  expect(output).toContain("# src/**/*.ts");
  expect(output).toContain("# tests/**/*.ts");
  expect(output).toContain(
    `<!-- BEGIN CURSOR_RULES: file=${alphaRel} glob=src/**/*.ts -->`,
  );
  expect(output).toContain(
    `<!-- END CURSOR_RULES: file=${alphaRel} glob=tests/**/*.ts -->`,
  );
  expect(output).toContain("## Alpha Title");
  expect(output).toContain("```ts\n# not demoted\n```");
  expect(output).not.toContain("\n# Alpha Title");
});
