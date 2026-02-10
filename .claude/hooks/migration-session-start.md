---
event: PreToolUse
matcher: Read|Glob|Grep
---

# Migration Session Start Hook

Loads migration context when accessing migration-related files.

## Trigger

- Event: PreToolUse
- Tools: Read, Glob, Grep
- Path filter: `jargon-lms/` or `migration-files/` (checked in script)

## Validation Script

```bash
#!/bin/bash
# Migration Session Start - Load context for migration work

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // .tool_input.pattern // ""')

# Only trigger for migration-related paths
if [[ ! "$FILE_PATH" =~ (jargon-lms|migration-files) ]]; then
  exit 0  # Not a migration file, skip
fi

# Check if already loaded this session (use marker file)
MARKER="/tmp/claude_migration_session_loaded"
if [[ -f "$MARKER" ]]; then
  exit 0  # Already loaded this session
fi

# Mark as loaded
touch "$MARKER"

# Display migration context reminder
echo ""
echo "========================================"
echo "MIGRATION SESSION STARTED"
echo "========================================"
echo ""
echo "Remember to check migration status:"
echo "  mcp__serena__read_memory('MIGRATION-STATUS.md')"
echo ""
echo "Current status: 0/7 modules complete"
echo "Next module: M001 Auth/Login"
echo ""
echo "Update status before ending session!"
echo "========================================"
echo ""

exit 0  # Allow operation to proceed
```

## Decision Logic

- **Allow always**: This hook never blocks
- **Show once**: Uses marker file to show only once per session
- **Path filter**: Only triggers for migration-related paths

## Integration

Works with:
- `migration-commit-validator.md` - Validates before commits
- `migration-session-summary.md` - Periodic reminders
