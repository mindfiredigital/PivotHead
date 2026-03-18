# CLAUDE.md

@AGENTS.md

## Claude Code-Specific Rules

### Permission Model

- Always ask [y/n] before: git push, deleting files, any destructive operation
- Proceed without asking: build, test, lint, git add, git commit

### Context Management

- /clear after every completed task
- At 60k tokens: save progress to `session-context.md` → /clear → resume
- Never let context fill to limit

### Thinking Depth

- Simple tasks: default
- Complex features: think hard before starting
- Architecture decisions: ultrathink

### Commit Format

```
feat(scope): description
fix(scope): description
chore(scope): description
```

### Branch Naming

```
feature/{domain}/{short-name}
fix/{domain}/{short-name}
```

## Quality Gates (Non-Negotiable)

After every phase checkpoint:

1. `pnpm build` → 0 errors, 0 warnings
2. `pnpm lint` → clean
3. `pnpm test` → all green

Before every commit:

1. Build must pass
2. Lint must pass

### Never commit if:

- Any test is failing
- Lint has errors
- Build has TypeScript errors
