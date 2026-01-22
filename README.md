# cursor-rules-to-agents-md

Convert `.cursor/rules` into a standardized `AGENTS.md` file. The CLI supports inline rule embedding or a reference-only mode, and it handles existing `AGENTS.md` files with overwrite/append logic.

## Usage

Interactive mode (prompts for output mode and write behavior when needed):

```sh
npx cursor-rules-to-agents-md
pnpx cursor-rules-to-agents-md
bunx cursor-rules-to-agents-md
```

Inline mode:

Will embed your rule files inline in the `AGENTS.md` file.

```sh
npx cursor-rules-to-agents-md --mode inline
pnpx cursor-rules-to-agents-md --mode inline
bunx cursor-rules-to-agents-md --mode inline
```

Reference mode:

Will reference your rule files via `@` syntax in the `AGENTS.md` file.

```sh
npx cursor-rules-to-agents-md --mode reference
pnpx cursor-rules-to-agents-md --mode reference
bunx cursor-rules-to-agents-md --mode reference
```

Reference output format:

```md
## Ruleset: TypeScript Rules

**Applies to (globs):**

- `src/**/*.ts`
- `tests/**/*.ts`

**Includes:**

- `@src/tests/fixtures/repo-a/.cursor/rules/alpha.md`

---
```

Overwrite vs append behavior when `AGENTS.md` exists:

```sh
# Default is append when no markers exist.
bunx cursor-rules-to-agents-md --mode inline

# Force overwrite.
bunx cursor-rules-to-agents-md --mode inline --overwrite
```

Custom rules can be added below the insert marker:

```md
<!-- cursor-rules-to-agents-md - INSERT CUSTOM RULES BELOW -->
```
