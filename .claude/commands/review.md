Review implementation for: $ARGUMENTS

Read-only mode — do NOT modify any files.

Steps:

1. Read: openspec/archive/$ARGUMENTS/ (or openspec/changes/$ARGUMENTS/)
2. Read: openspec/specs/ (current system state)
3. Read: docs/FRS.md (original requirements)
4. Compare implementation against spec scenarios AND FRS criteria
5. Output:
   ✅ Implemented: [scenario]
   ❌ Missing: [scenario]
   ⚠️ Drifted: [scenario — spec says X, code does Y]
   🔒 Security: [concern]
   📋 FRS gap: [requirement not addressed]
6. No style feedback — compliance only

Format: /review pivothead-llm-package
