import { promises as fs } from "node:fs";
import path from "node:path";
import { demoteH1ToH2, titleFromRule } from "./markdown";

export type RuleMeta = {
  globs?: string[];
  description?: string;
  alwaysApply?: boolean;
};

export type ParsedRule = {
  meta: RuleMeta;
  body: string;
};

export type RuleFile = {
  absPath: string;
  relPath: string;
  meta: RuleMeta;
  body: string;
  globs: string[];
};

const RULE_EXTENSIONS = new Set([".md", ".mdc"]);

/**
 * Recursively find .md and .mdc files under the provided rules directory.
 */
export async function findCursorRules(rulesDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() && RULE_EXTENSIONS.has(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  await walk(rulesDir);
  return results.sort((a, b) => a.localeCompare(b));
}

/**
 * Parse a cursor rule file with a minimal frontmatter subset: globs, description, alwaysApply.
 */
export function parseRuleFile(text: string): ParsedRule {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    return { meta: {}, body: text };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { meta: {}, body: text };
  }

  const metaLines = lines.slice(1, endIndex);
  const meta = parseFrontmatter(metaLines);
  const body = lines.slice(endIndex + 1).join("\n");

  return { meta, body };
}

/**
 * Normalize rule globs, defaulting to a double-star glob when absent.
 */
export function normalizeGlobs(meta: RuleMeta): string[] {
  if (!meta.globs || meta.globs.length === 0) {
    return ["**/*"];
  }
  return meta.globs;
}

/**
 * Load and parse rule files, returning normalized rule metadata with relative paths.
 */
export async function loadRuleFiles(rulesDir: string): Promise<RuleFile[]> {
  const absPaths = await findCursorRules(rulesDir);
  const cwd = process.cwd();

  const rules: RuleFile[] = [];
  for (const absPath of absPaths) {
    const raw = await fs.readFile(absPath, "utf8");
    const parsed = parseRuleFile(raw);
    const relPath = toPosixPath(path.relative(cwd, absPath));
    rules.push({
      absPath,
      relPath,
      meta: parsed.meta,
      body: parsed.body,
      globs: normalizeGlobs(parsed.meta),
    });
  }

  return rules;
}

/**
 * Generate inline content with per-glob headings and embedded rule bodies.
 */
export function generateInlineContent(rules: RuleFile[]): string {
  const sections: string[] = [];

  for (const rule of rules) {
    const demoted = demoteH1ToH2(rule.body).trimEnd();
    for (const glob of rule.globs) {
      sections.push(`# ${glob}`);
      sections.push("");
      sections.push(
        `<!-- BEGIN CURSOR_RULES: file=${rule.relPath} glob=${glob} -->`,
      );
      sections.push("");
      if (demoted) {
        sections.push(demoted);
        sections.push("");
      }
      sections.push(
        `<!-- END CURSOR_RULES: file=${rule.relPath} glob=${glob} -->`,
      );
      sections.push("");
    }
  }

  return sections.join("\n").trimEnd();
}

/**
 * Generate reference content pointing to rule files by glob.
 */
export function generateReferenceContent(rules: RuleFile[]): string {
  const sections: string[] = [];

  for (const rule of rules) {
    sections.push(`## Ruleset: ${titleFromRule(rule.meta, rule.relPath)}`);
    sections.push("**Applies to (globs):**");
    for (const glob of rule.globs) {
      sections.push(`* \`${glob}\``);
    }
    sections.push("");
    sections.push("**Includes:**");
    sections.push(`* \`@${toPosixPath(rule.relPath)}\``);
    sections.push("");
    sections.push("---");
    sections.push("");
  }

  return sections.join("\n").trimEnd();
}

function parseFrontmatter(lines: string[]): RuleMeta {
  const meta: RuleMeta = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) {
      continue;
    }

    const key = match[1];
    const rawValue = match[2];

    if (rawValue === "") {
      const values: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("- ")) {
        i += 1;
        values.push(unquote(lines[i].trim().slice(2)));
      }
      if (key === "globs") {
        meta.globs = values;
      }
      continue;
    }

    if (key === "globs") {
      if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        const inner = rawValue.slice(1, -1).trim();
        meta.globs = inner
          ? inner
              .split(",")
              .map((value) => unquote(value.trim()))
              .filter(Boolean)
          : [];
      } else {
        meta.globs = [unquote(rawValue)];
      }
      continue;
    }

    if (key === "description") {
      meta.description = unquote(rawValue);
      continue;
    }

    if (key === "alwaysApply") {
      meta.alwaysApply = rawValue === "true";
    }
  }

  return meta;
}

function unquote(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}
