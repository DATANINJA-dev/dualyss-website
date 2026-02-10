---
event: PreToolUse
matcher: Write
---

# Epic Pre-Write Validation Hook

Validates epic file content before writing to `backlog/epics/`.

## Trigger Conditions

- Tool: Write
- Path pattern: `backlog/epics/*.md`

## Validation Checks

### 1. Required Frontmatter Fields

```yaml
id: EPIC-XXX          # Must match pattern
type: epic            # Must be "epic"
status: backlog       # Must be valid status
created: YYYY-MM-DD   # Must be valid date
```

### 2. PRD Validation (if has_prd: true)

```yaml
prd:
  vision: "..."       # Not empty
  problem: "..."      # Not empty
  personas:
    primary:
      name: "..."     # Not empty
```

### 3. Content Quality

- No placeholder text: `{{`, `[TBD]`, `[PENDING]`, `[TODO]`
- Description section not empty
- At least 2 acceptance criteria
- At least 1 "In Scope" item

### 4. Dependency Integrity

- All `depends_on` references must exist in epics.json
- No circular dependencies
- No self-reference

## Validation Script

```bash
#!/bin/bash
# Validate epic file before write with severity levels

FILE_PATH="$1"
CONTENT="$2"

CRITICAL_ISSUES=""
WARNINGS=""

# === CRITICAL CHECKS (will block) ===

# Check ID format
if ! echo "$CONTENT" | grep -qE '^id: EPIC-[0-9]{3}'; then
  CRITICAL_ISSUES="${CRITICAL_ISSUES}Invalid epic ID format (must be EPIC-XXX). "
fi

# Check required frontmatter fields
if ! echo "$CONTENT" | grep -qE '^type: epic'; then
  CRITICAL_ISSUES="${CRITICAL_ISSUES}Missing 'type: epic' in frontmatter. "
fi

if ! echo "$CONTENT" | grep -qE '^status: (backlog|in_progress|done)'; then
  CRITICAL_ISSUES="${CRITICAL_ISSUES}Missing or invalid status. "
fi

if ! echo "$CONTENT" | grep -qE '^created: [0-9]{4}-[0-9]{2}-[0-9]{2}'; then
  CRITICAL_ISSUES="${CRITICAL_ISSUES}Missing or invalid created date. "
fi

# === WARNING CHECKS (will allow but report) ===

# Check for placeholder text
if echo "$CONTENT" | grep -qE '\{\{|\[TBD\]|\[PENDING\]|\[TODO\]'; then
  WARNINGS="${WARNINGS}Contains placeholder text. "
fi

# Check for minimum acceptance criteria (simple heuristic)
AC_COUNT=$(echo "$CONTENT" | grep -c '^\s*-.*acceptance\|^\s*-.*criteria\|^## Acceptance' || echo "0")
if [ "$AC_COUNT" -lt 2 ]; then
  WARNINGS="${WARNINGS}Fewer than 2 acceptance criteria. "
fi

# === OUTPUT DECISION ===

if [ -n "$CRITICAL_ISSUES" ]; then
  echo "BLOCKED: ${CRITICAL_ISSUES}"
  [ -n "$WARNINGS" ] && echo "Additional warnings: ${WARNINGS}"
  exit 1
fi

if [ -n "$WARNINGS" ]; then
  echo "WARNING: ${WARNINGS}Proceeding with write."
  exit 0
fi

echo "OK: Epic validation passed"
exit 0
```

## Severity Levels

Validation issues are classified by severity to determine appropriate action:

### Critical (BLOCK - behavior: "deny")

Issues that would create broken or invalid epics:
- Invalid ID format (not `EPIC-XXX`)
- Missing required frontmatter fields (`id`, `type`, `status`, `created`)
- Invalid dependency references (non-existent epic IDs)
- Circular dependencies detected
- Self-referencing dependency

### Warning (ALLOW with message - behavior: "allow")

Issues that reduce quality but don't break functionality:
- Placeholder text detected (`{{`, `[TBD]`, `[PENDING]`, `[TODO]`)
- Fewer than 2 acceptance criteria
- Empty "In Scope" section
- Missing optional PRD fields when `has_prd: true`

## On Failure

1. **For Critical issues**: Block the write and return specific error
2. **For Warning issues**: Allow the write but return warning message for Claude to address
3. **For mixed issues**: Block if ANY critical issue exists; include all warnings in message

## Output Format

### All Checks Pass
```json
{
  "decision": {
    "behavior": "allow",
    "message": "Validation passed"
  }
}
```

### Critical Issues Found (BLOCK)
```json
{
  "decision": {
    "behavior": "deny",
    "message": "BLOCKED: [critical issue]. Fix required before write."
  }
}
```

### Warnings Only (ALLOW with feedback)
```json
{
  "decision": {
    "behavior": "allow",
    "message": "WARNING: [issues found]. Consider addressing: [list]. Proceeding with write."
  }
}
```

### Mixed Critical + Warning
```json
{
  "decision": {
    "behavior": "deny",
    "message": "BLOCKED: [critical issue]. Additional warnings: [list]. Fix critical issue before write."
  }
}
```
