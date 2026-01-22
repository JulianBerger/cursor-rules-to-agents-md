import { promises as fs } from "node:fs";
import path from "node:path";
import {
  generateInlineContent,
  generateReferenceContent,
  loadRuleFiles,
} from "./lib/cursorRules";
import {
  GENERATED_INSERT,
  GENERATED_START,
  hasMarkers,
  wrapGeneratedContent,
  writeAgentsFile,
  type WriteMode,
} from "./lib/agentsFile";
import { promptMode } from "./lib/tui";

type CliOptions = {
  mode?: "inline" | "reference";
  outPath: string;
  cursorDir: string;
  rulesDir: string;
  writeMode?: WriteMode;
  dryRun: boolean;
  quiet: boolean;
};

const COLORS = {
  red: (value: string) => `\x1b[31m${value}\x1b[0m`,
  yellow: (value: string) => `\x1b[33m${value}\x1b[0m`,
  cyan: (value: string) => `\x1b[36m${value}\x1b[0m`,
};

const args = process.argv.slice(2);

async function main() {
  const options = parseArgs(args);

  if (!options.mode) {
    options.mode = await promptMode();
  }

  if (!(await pathExists(options.cursorDir))) {
    console.error(
      COLORS.red(
        `❌ Missing .cursor directory at ${options.cursorDir}. Cannot continue.`,
      ),
    );
    process.exit(1);
  }

  const rules = await loadRuleFiles(options.rulesDir);
  const innerContent =
    options.mode === "inline"
      ? generateInlineContent(rules)
      : generateReferenceContent(rules);
  const wrapped = wrapGeneratedContent(innerContent);

  const outExists = await pathExists(options.outPath);
  if (outExists) {
    const existingText = await fs.readFile(options.outPath, "utf8");
    if (!hasMarkers(existingText) && !options.quiet && !options.writeMode) {
      console.warn(
        COLORS.yellow(`⚠️ ${path.basename(options.outPath)} already exists.`),
      );
    }
  }

  const writeMode = options.writeMode ?? "append";
  const result = await writeAgentsFile({
    outPath: options.outPath,
    content: wrapped,
    writeMode,
    dryRun: options.dryRun,
  });

  if (options.dryRun && result) {
    console.log(result.finalContent);
    return;
  }

  if (!options.quiet) {
    console.log(
      COLORS.cyan(
        `Generated ${path.basename(options.outPath)} with markers ${GENERATED_START} ... ${GENERATED_INSERT}`,
      ),
    );
  }
}

function parseArgs(argv: string[]): CliOptions {
  let mode: "inline" | "reference" | undefined;
  let outPath = "AGENTS.md";
  let cursorDir = ".cursor";
  let rulesDir: string | undefined;
  let writeMode: WriteMode | undefined;
  let dryRun = false;
  let quiet = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--mode": {
        const value = argv[i + 1];
        if (!value || (value !== "inline" && value !== "reference")) {
          exitInvalidArgs("--mode requires inline or reference");
        }
        mode = value;
        i += 1;
        break;
      }
      case "--inline":
        mode = "inline";
        break;
      case "--reference":
        mode = "reference";
        break;
      case "--out": {
        const value = argv[i + 1];
        if (!value) {
          exitInvalidArgs("--out requires a path");
        }
        outPath = value;
        i += 1;
        break;
      }
      case "--cursor-dir": {
        const value = argv[i + 1];
        if (!value) {
          exitInvalidArgs("--cursor-dir requires a path");
        }
        cursorDir = value;
        i += 1;
        break;
      }
      case "--rules-dir": {
        const value = argv[i + 1];
        if (!value) {
          exitInvalidArgs("--rules-dir requires a path");
        }
        rulesDir = value;
        i += 1;
        break;
      }
      case "--write": {
        const value = argv[i + 1];
        if (!value || (value !== "overwrite" && value !== "append")) {
          exitInvalidArgs("--write requires overwrite or append");
        }
        writeMode = value;
        i += 1;
        break;
      }
      case "--overwrite":
        writeMode = "overwrite";
        break;
      case "--append":
        writeMode = "append";
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--quiet":
        quiet = true;
        break;
      default:
        exitInvalidArgs(`Unknown argument: ${arg}`);
    }
  }

  const resolvedRulesDir = rulesDir ?? path.join(cursorDir, "rules");

  return {
    mode,
    outPath,
    cursorDir,
    rulesDir: resolvedRulesDir,
    writeMode,
    dryRun,
    quiet,
  };
}

function exitInvalidArgs(message: string): never {
  console.error(message);
  process.exit(2);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
