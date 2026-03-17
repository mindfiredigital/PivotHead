Create technical plan for: $ARGUMENTS

Steps:

1. Read: openspec/changes/$ARGUMENTS/proposal.md
2. Read: openspec/changes/$ARGUMENTS/specs/
3. Read: docs/SDS.md (architecture decisions + type contracts + API conventions)
4. Read: AGENTS.md + relevant package CLAUDE.md
5. Scan existing codebase for reusable patterns
6. Generate plan covering:
   - Exact file paths to create/modify
   - TypeScript interfaces (final shapes, matching SDS contracts)
   - Architecture decisions with reasoning
   - Reuse of existing shared code
   - Build + test + lint checkpoint commands
7. Save to: openspec/changes/$ARGUMENTS/plan.md
8. Wait for approval before any implementation

Format: /plan pivothead-llm-package
