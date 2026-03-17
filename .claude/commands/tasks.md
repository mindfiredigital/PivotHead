Break down into tasks for: $ARGUMENTS

Steps:

1. Read: openspec/changes/$ARGUMENTS/proposal.md
2. Read: openspec/changes/$ARGUMENTS/plan.md
3. Generate sequenced task checklist:
   - Phase 1: Foundation (shared types, package scaffolding)
   - Phase 2: Core implementation [mark PARALLEL tasks]
   - Phase 3: Integration
   - Phase 4: Tests (one test per spec scenario)
   - Checkpoint after each phase:
     - pnpm build → 0 errors
     - pnpm lint → clean
     - pnpm test → all green
4. Save to: openspec/changes/$ARGUMENTS/tasks.md
5. Wait for approval

Format: /tasks pivothead-llm-package
