# Repository Guidelines

## Project Structure & Module Organization

- This repository is a open source project that is built with Bun.
- It is a simple tool to convert cursor rules to a standardized AGENTS.md file.

### Bun Setup

- Use Bun's built-in features instead of additional packages where possible
- Leverage Bun's native TypeScript support (no separate build step)

## Build, Test, and Development Commands

- Dev: `bun run dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Format (lint --fix): `bun run format`
- Typecheck: `bun run typecheck`
- Full check (format + lint + typecheck): `bun run check`

## Code Organization

/
├── src/
│ ├── lib/ # Utility functions
│ └── tests/ # Tests
└── package.json

## Implementation Rules

### When creating new files:

1. Start with the minimum viable implementation
2. Add features only when explicitly requested
3. Prefer inline functions over separate utility files unless reused 3+ times
4. Use TypeScript sparingly - only for complex types

### When adding dependencies:

1. Check if Bun has a built-in alternative
2. Check if the feature can be implemented in <20 lines
3. Prefer lighter alternatives (e.g., clsx over classnames)
4. Document why each dependency is necessary

## Cursor Rules Specification

Project rules live in `.cursor/rules` as markdown files. They are scoped using path patterns, invoked manually, or included based on relevance.

### Folder Structure

```
.cursor/rules/
  react-patterns.mdc       # Rule with frontmatter (description, globs)
  api-guidelines.md        # Simple markdown rule
  frontend/                # Organize rules in folders
    components.md
```

Rules are stored in the following format (example):

```markdown
---
globs:
description: "Use our internal RPC pattern when defining services"
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

## AGENTS.md Specification

Unlike Project Rules, AGENTS.md is a plain markdown file without metadata or complex configurations. It's perfect for projects that need simple, readable instructions without the overhead of structured rules.

For more complex projects, it's possible to reference other markdown files within `AGENTS.md` using the `@` syntax.

```markdown
# AGENTS.md

## Setup commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Blog Posts

Include the following rules for files that match the glob pattern: `src/blog/**/*.md`:

- @.cursor/rules/blog-posts.mdc

## API

Include the following rules:

- @.cursor/rules/api-guidelines.md
```

## Commit & Pull Request Guidelines

- Use short, imperative commit messages (for example, "Add lint config") and include PR descriptions that summarize changes, link related issues, and note any verification steps.

## Agent-Specific Instructions

- Keep this document up to date as soon as build tooling, directory structure, or testing conventions are introduced.
- Prefer explicit, reproducible commands and keep examples aligned with the actual project layout.
