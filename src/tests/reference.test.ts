import { expect, test } from "bun:test";
import {
  generateReferenceContent,
  loadRuleFiles,
} from "../lib/cursorRules";
import { joinPath, relativePath, toPosixPath } from "./helpers";

const fixtureRoot = joinPath(process.cwd(), "src/tests/fixtures/repo-a");
const rulesDir = joinPath(fixtureRoot, ".cursor/rules");
const cwd = toPosixPath(process.cwd());

test("reference mode emits section titles and @ references", async () => {
  const rules = await loadRuleFiles(rulesDir);
  const output = generateReferenceContent(rules);

  const alphaAbs = joinPath(rulesDir, "alpha.md");
  const alphaRel = relativePath(cwd, alphaAbs);

  expect(output).toContain("## Ruleset: TypeScript Rules");
  expect(output).toContain("* `src/**/*.ts`");
  expect(output).toContain("* `tests/**/*.ts`");
  expect(output).toContain(`* \`@${alphaRel}\``);
  expect(output).toContain("---");
});
