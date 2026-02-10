---
event: PreToolUse
matcher: Write
---

# Claude File Pre-Write Validation

## Trigger Conditions

- Tool: Write
- Path pattern: `.claude/**/*.md`

Only triggers when writing to Claude Code configuration files.

## Validation Checks

When a Write operation targets `.claude/` directory:

### 1. Path Validation
- Is target within `.claude/commands/`, `.claude/agents/`, `.claude/skills/`, or `.claude/hooks/`?
- Does filename follow conventions?
  - Commands: `lowercase-with-dashes.md`
  - Agents: `descriptive-purpose.md`
  - Skills: `skill-name/SKILL.md`
  - Hooks: `trigger-context.md`

### 2. Frontmatter Validation
Check for required frontmatter fields based on component type:

**Commands:**
- `description` - Required
- `allowed-tools` - Required

**Agents:**
- `name` - Required
- `description` - Required
- `model` - Required (haiku, sonnet, opus)
- `tools` - Required

**Skills (SKILL.md):**
- `name` - Required
- `description` - Required

**Hooks:**
- `event` - Required (valid event type)
- `matcher` - Required

### 3. Content Structure
- Has title matching filename
- Has required sections per type
- No placeholder text (`{{`, `[TBD]`, `[TODO]`)

### 4. Security Check (Agents/Commands)
- Tool permissions reasonable
- No blanket Bash access without restrictions
- Write/Edit justified

## Validation Script

```bash
#!/bin/bash
# Validate Claude Code configuration files before write

FILE_PATH="$1"
CONTENT="$2"

# Determine component type from path
if [[ "$FILE_PATH" == *".claude/commands/"* ]]; then
  TYPE="command"
elif [[ "$FILE_PATH" == *".claude/agents/"* ]]; then
  TYPE="agent"
elif [[ "$FILE_PATH" == *".claude/skills/"* ]]; then
  TYPE="skill"
elif [[ "$FILE_PATH" == *".claude/hooks/"* ]]; then
  TYPE="hook"
else
  echo "WARN: Unknown component type for path: $FILE_PATH"
  exit 0  # Allow unknown paths
fi

# Check for placeholder text
if echo "$CONTENT" | grep -qE '\{\{.*\}\}|\[TBD\]|\[TODO\]|\[PENDING\]'; then
  echo "ERROR: Contains placeholder text"
  exit 1
fi

# Validate frontmatter based on type
case $TYPE in
  command)
    if ! echo "$CONTENT" | grep -qE '^description:'; then
      echo "ERROR: Command missing required field 'description'"
      exit 1
    fi
    if ! echo "$CONTENT" | grep -qE '^allowed-tools:'; then
      echo "ERROR: Command missing required field 'allowed-tools'"
      exit 1
    fi
    ;;
  agent)
    for field in "name:" "description:" "model:" "tools:"; do
      if ! echo "$CONTENT" | grep -qE "^$field"; then
        echo "ERROR: Agent missing required field '$field'"
        exit 1
      fi
    done
    # Validate model value
    if ! echo "$CONTENT" | grep -qE 'model: (haiku|sonnet|opus)'; then
      echo "ERROR: Agent model must be haiku, sonnet, or opus"
      exit 1
    fi
    ;;
  skill)
    if ! echo "$CONTENT" | grep -qE '^name:'; then
      echo "ERROR: Skill missing required field 'name'"
      exit 1
    fi
    if ! echo "$CONTENT" | grep -qE '^description:'; then
      echo "ERROR: Skill missing required field 'description'"
      exit 1
    fi
    ;;
  hook)
    if ! echo "$CONTENT" | grep -qE '^event:'; then
      echo "ERROR: Hook missing required field 'event'"
      exit 1
    fi
    if ! echo "$CONTENT" | grep -qE '^matcher:'; then
      echo "ERROR: Hook missing required field 'matcher'"
      exit 1
    fi
    # Validate event type
    if ! echo "$CONTENT" | grep -qE 'event: (PreToolUse|PostToolUse|Stop|SubagentStop|SessionStart|SessionEnd|UserPromptSubmit|PreCompact|Notification)'; then
      echo "WARN: Unrecognized event type"
    fi
    ;;
esac

# Security: Check for blanket Bash without restrictions
if echo "$CONTENT" | grep -qE 'allowed-tools:.*Bash' || echo "$CONTENT" | grep -qE 'tools:.*Bash'; then
  if ! echo "$CONTENT" | grep -qiE 'restrict|limit|only|specific'; then
    echo "WARN: Bash access without documented restrictions"
  fi
fi

echo "OK: $TYPE validation passed"
exit 0
```

## Output Format

```json
{
  "decision": {
    "behavior": "allow|warn|deny",
    "message": "Validation result message"
  },
  "validation": {
    "path_valid": true,
    "frontmatter_valid": true,
    "structure_valid": true,
    "security_ok": true
  },
  "issues": []
}
```

## Decision Logic

### Allow
- All validations pass
- Minor style issues only

### Warn (Allow with message)
- Missing optional sections
- Broad tool permissions with justification
- Could improve but functional

### Deny
- Missing required frontmatter
- Invalid event type (hooks)
- Wildcard matcher without justification
- Security concern (blanket Bash)

## On Failure

If validation fails:

1. Return deny with specific message
2. List missing/invalid fields
3. Suggest fixes:
   ```
   Missing required frontmatter field 'description'.

   Add to top of file:
   ---
   description: [Your description here]
   ---
   ```

4. Do not auto-fix - let user correct

## Example Checks

### Valid Command
```yaml
---
description: Creates a new task from user input
allowed-tools: Read, Write, Task
---
# create-task
...
```
Result: `allow`

### Invalid Agent (missing model)
```yaml
---
name: My Agent
description: Does something
tools: Read
---
```
Result: `deny` - "Missing required field 'model'. Add: model: haiku|sonnet|opus"

### Warn (broad permissions)
```yaml
---
description: Build system
allowed-tools: Bash, Write, Edit, Read
---
```
Result: `warn` - "Broad tool permissions. Consider documenting restrictions."
