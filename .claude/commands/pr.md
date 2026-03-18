Prepare PR for: $ARGUMENTS

Steps:

1. Run:
   pnpm lint
   pnpm test
   (Fix any failures before proceeding)
2. Run: git diff main --stat
3. Read: openspec/archive/$ARGUMENTS/proposal.md
4. Generate commit:
   feat(scope): description
   - bullet 1
   - bullet 2

5. Ask: "Run git add . && git commit? [y/n]"
6. Generate PR description:
   ## What
   ## FRS Requirements Covered
   ## Spec Artifacts
   ## Checklist
   ## Test Coverage
7. Ask: "Run git push? [y/n]"

Format: /pr pivothead-llm-package
