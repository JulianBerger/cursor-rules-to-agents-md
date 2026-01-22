import { expect, test } from "bun:test";
import {
  GENERATED_INSERT,
  GENERATED_START,
  backupFile,
  writeAgentsFile,
  upsertGeneratedBlock,
  wrapGeneratedContent,
} from "../lib/agentsFile";
import { generateReferenceContent, loadRuleFiles } from "../lib/cursorRules";
import { joinPath } from "./helpers";

const tmpDir = joinPath(process.cwd(), "src/tests/fixtures/tmp");
const fixtureRoot = joinPath(process.cwd(), "src/tests/fixtures/repo-a");
const rulesDir = joinPath(fixtureRoot, ".cursor/rules");

test("replaces generated block and preserves custom rules", () => {
  const existing = `${GENERATED_START}\nold\n${GENERATED_INSERT}\nCustom rules`;
  const wrapped = wrapGeneratedContent("new rules");
  const updated = upsertGeneratedBlock(existing, wrapped);

  expect(updated).toContain("new rules");
  expect(updated).toContain("Custom rules");
  expect(updated).not.toContain("old");
});

test("appends a single block when markers are absent", () => {
  const wrapped = wrapGeneratedContent("content");
  const updated = upsertGeneratedBlock("Existing notes", wrapped);

  expect(updated).toContain("Existing notes");
  expect(updated).toContain(GENERATED_START);
  expect(updated).toContain(GENERATED_INSERT);
});

test("backup filename format uses timestamp", async () => {
  const filePath = joinPath(tmpDir, "agents-backup.md");
  await Bun.write(filePath, "backup me");

  const fixedDate = new Date("2024-01-02T03:04:05Z");
  const backupPath = await backupFile(filePath, () => fixedDate);

  expect(backupPath).toContain("AGENTS.20240102-030405.bak");
  expect(await Bun.file(backupPath).exists()).toBeTrue();
  const content = await Bun.file(backupPath).text();
  expect(content).toBe("backup me");
});

test("writes a generated AGENTS.md file to disk", async () => {
  const outPath = joinPath(tmpDir, "AGENTS.generated.md");
  const rules = await loadRuleFiles(rulesDir);
  const wrapped = wrapGeneratedContent(generateReferenceContent(rules));

  await writeAgentsFile({
    outPath,
    content: wrapped,
    writeMode: "overwrite",
    dryRun: false,
  });

  const written = await Bun.file(outPath).text();
  expect(written).toContain(GENERATED_START);
  expect(written).toContain("## Ruleset: TypeScript Rules");
  expect(written).toContain(GENERATED_INSERT);
});
