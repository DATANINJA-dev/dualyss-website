---
event: PostToolUse
matcher: Write|Edit
---

# Migration Session Summary Hook

Provides periodic reminders to update migration status after modifying jargon-lms/ files.

## Trigger

- Event: PostToolUse
- Tools: Write, Edit
- Path filter: `jargon-lms/` (checked in script)

## Validation Script

```bash
#!/bin/bash
# Migration Session Summary - Periodic reminders after edits

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Only trigger for jargon-lms/ files
if [[ ! "$FILE_PATH" =~ jargon-lms/ ]]; then
  exit 0  # Not a migration file, skip
fi

# Counter file for tracking edits
COUNTER_FILE="/tmp/claude_migration_edit_count"

# Read or initialize counter
if [[ -f "$COUNTER_FILE" ]]; then
  COUNT=$(cat "$COUNTER_FILE")
else
  COUNT=0
fi

# Increment counter
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNTER_FILE"

# Show reminder every 5 edits
if [[ $((COUNT % 5)) -eq 0 ]]; then
  echo ""
  echo "======================================"
  echo "MIGRATION PROGRESS REMINDER"
  echo "======================================"
  echo ""
  echo "Files modified this session: $COUNT"
  echo ""
  echo "Don't forget to update MIGRATION-STATUS.md!"
  echo "======================================"
  echo ""
fi

exit 0
```

## Behavior

### File Counter

Track modifications to jargon-lms/ files during session:

```
MIGRATION_EDITS_COUNT: 0 → 1 → 2 → ... → 5 (trigger reminder)
```

### Reminder Threshold

After every 5 file modifications, display:

```
======================================
MIGRATION PROGRESS REMINDER
======================================

Files modified this session: 5

Don't forget to update MIGRATION-STATUS.md!

Quick update command:
  mcp__serena__edit_memory({
    memory_file_name: "MIGRATION-STATUS.md",
    needle: "| MXXX | ... | pending |",
    repl: "| MXXX | ... | in_progress |",
    mode: "regex"
  })

Current module: [detected from file paths]
======================================
```

### Session End Reminder

When significant work is detected (10+ edits), provide summary:

```
======================================
SESSION SUMMARY
======================================

Files created: 3
Files modified: 7
Total changes: 10

Module worked on: M001 Auth/Login

BEFORE ENDING SESSION:
1. Update MIGRATION-STATUS.md
2. Commit your changes
3. Note any blockers for next session

======================================
```

## Module Detection Logic

Detect current module from file paths:

| Path Pattern | Module |
|--------------|--------|
| `auth/`, `login/`, `session/` | M001 Auth/Login |
| `admin/` | M002 Admin Portal |
| `lesson/`, `lessons/` | M003 Lecciones |
| `learning-path/` | M004 Learning Paths |
| `speech/`, `audio/`, `tts/`, `stt/` | M005 Speech |
| `ai/`, `tutor/`, `chat/`, `roleplay/` | M006 AI Tutor |
| `exam/`, `test/`, `quiz/` | M007 Exámenes |

## Non-Blocking Design

This hook:
- Never blocks operations
- Only displays informational messages
- Uses counters to avoid excessive reminders
- Provides actionable commands

## State Tracking

Maintain session state (reset on new conversation):

```javascript
const sessionState = {
  filesCreated: 0,
  filesModified: 0,
  lastReminder: 0,
  detectedModules: new Set()
};
```

## Integration

Works with:
- `migration-session-start.md` - Loads initial context
- `migration-commit-validator.md` - Validates at commit time

## Why PostToolUse?

- Runs AFTER the file operation completes
- Does not interrupt the workflow
- Provides timely reminders without blocking
- Counter-based to avoid notification fatigue
