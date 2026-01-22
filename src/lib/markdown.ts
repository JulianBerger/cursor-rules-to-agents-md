import path from "node:path";
import type { RuleMeta } from "./cursorRules";

const FENCE_REGEX = /^(```|~~~)/;

/**
 * Demote H1 headings to H2, skipping fenced code blocks.
 */
export function demoteH1ToH2(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  const nextLines = lines.map((line) => {
    const trimmed = line.trim();
    if (FENCE_REGEX.test(trimmed)) {
      inFence = !inFence;
      return line;
    }
    if (!inFence && line.startsWith("# ")) {
      return `## ${line.slice(2)}`;
    }
    return line;
  });

  return nextLines.join("\n");
}

/**
 * Derive a display title from rule metadata or filename.
 */
export function titleFromRule(meta: RuleMeta, filePath: string): string {
  if (meta.description) {
    return meta.description;
  }

  const base = path.basename(filePath).replace(/\.(md|mdc)$/i, "");
  const words = base.split(/[-_]/g).filter(Boolean);
  if (words.length === 0) {
    return "Rules";
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
