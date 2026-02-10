---
event: PreToolUse
matcher: Bash
---

# Migration Commit Validator Hook

Validates that migration status is updated before committing changes to jargon-lms/.

## Trigger

- Event: PreToolUse
- Tool: Bash
- Command filter: `git commit` (checked in script)

## Validation Script

```bash
#!/bin/bash
# Migration Commit Validator - Remind to update status before commit

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only trigger for git commit commands
if [[ ! "$COMMAND" =~ "git commit" ]]; then
  exit 0  # Not a commit command, skip
fi

# Check if staged files include jargon-lms/ changes
MIGRATION_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E "^jargon-lms/" || true)

if [ -z "$MIGRATION_FILES" ]; then
  exit 0  # No migration files, skip
fi

MIGRATION_FILE_COUNT=$(echo "$MIGRATION_FILES" | wc -l | tr -d ' ')
```

### 2. Remind Status Update

If migration files are being committed:

```bash
echo ""
echo "========================================"
echo "MIGRATION COMMIT DETECTED"
echo "========================================"
echo ""
echo "Files in jargon-lms/: $MIGRATION_FILE_COUNT"
echo ""
echo "IMPORTANT: Have you updated MIGRATION-STATUS.md?"
echo ""
echo "Run this command to update status:"
echo "  mcp__serena__edit_memory({"
echo "    memory_file_name: 'MIGRATION-STATUS.md',"
echo "    needle: '| M00X | ... | pending |',"
echo "    repl: '| M00X | ... | in_progress |',"
echo "    mode: 'regex'"
echo "  })"
echo ""
echo "========================================"
```

### 3. Decision Logic

This hook does NOT block commits but provides strong reminders:

- **Always Allow**: Commits proceed regardless
- **Warn**: Display reminder about updating status
- **Log**: Record that migration files were committed

## Output Format

```
Migration files detected: 5
========================================
MIGRATION COMMIT DETECTED
========================================

Files in jargon-lms/: 5

IMPORTANT: Have you updated MIGRATION-STATUS.md?

Run this command to update status:
  mcp__serena__edit_memory({...})

========================================

OK: Proceeding with commit (remember to update status!)
```

## Why Non-Blocking?

1. **User autonomy**: Developer knows best when to update status
2. **Avoid frustration**: Blocking for every small commit is annoying
3. **Trust**: The reminder is enough for disciplined workflow
4. **Flexibility**: Sometimes you commit incrementally before updating status

## Integration

Works alongside:
- `migration-session-start.md` - Loads context at start
- `migration-session-summary.md` - Periodic reminders
- `commit-validator.md` - General commit validation (runs first)

## Module Detection

For smarter reminders, detect which module is being worked on:

```bash
# Detect module from file paths
if echo "$MIGRATION_FILES" | grep -q "auth\|login\|session"; then
  echo "Detected module: M001 Auth/Login"
elif echo "$MIGRATION_FILES" | grep -q "admin"; then
  echo "Detected module: M002 Admin Portal"
elif echo "$MIGRATION_FILES" | grep -q "lesson"; then
  echo "Detected module: M003 Lecciones"
# ... etc
fi
```
