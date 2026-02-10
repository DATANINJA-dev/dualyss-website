---
event: PostToolUse
matcher: Write
---

# Epic Post-Create Verification Hook

Verifies epic creation and index synchronization after writing to `backlog/epics/`.

## Trigger Conditions

- Tool: Write
- Path pattern: `backlog/epics/*.md`
- Success: tool_response.success = true

## Verification Checks

### 1. File Integrity

- File exists at expected path
- File is valid markdown
- Frontmatter parses correctly as YAML

### 2. Index Synchronization

- Epic exists in `backlog/epics.json`
- Epic ID matches filename (EPIC-001.md -> id: EPIC-001)
- Status matches between file and index

### 3. Cross-Reference Validation

- If epic has `depends_on`, all dependencies exist
- If epic is product-scale (`has_prd: true`), PRD section present

### 4. Metadata Tracking

Log creation event with:
- Epic ID
- Creation timestamp
- QA score (from _generation_metadata)
- Reflection iterations used

## Verification Script

```bash
#!/bin/bash
# Enhanced epic verification

EPIC_FILE="$1"
EPIC_ID=$(basename "$EPIC_FILE" .md)
ISSUES=""
WARNINGS=""

# === FILE CHECKS ===
if [ ! -f "$EPIC_FILE" ]; then
  echo "ERROR: Epic file not created: $EPIC_FILE"
  exit 1
fi

# === INDEX CHECKS ===
if ! grep -q "\"id\": \"$EPIC_ID\"" backlog/epics.json 2>/dev/null; then
  ISSUES="${ISSUES}Epic not in epics.json index. "
fi

# === PRD CHECKS (if has_prd) ===
if grep -q "has_prd: true" "$EPIC_FILE"; then
  if ! grep -q "prd:" "$EPIC_FILE"; then
    ISSUES="${ISSUES}has_prd=true but no prd section found. "
  fi
  if ! grep -q "vision:" "$EPIC_FILE"; then
    WARNINGS="${WARNINGS}PRD missing vision. "
  fi
  if ! grep -q "personas:" "$EPIC_FILE"; then
    WARNINGS="${WARNINGS}PRD missing personas. "
  fi
fi

# === DEPENDENCY CHECKS ===
DEPS=$(grep -oP 'depends_on:.*\[.*?\]' "$EPIC_FILE" | grep -oP 'EPIC-[0-9]+' || true)
for DEP in $DEPS; do
  if [ "$DEP" = "$EPIC_ID" ]; then
    ISSUES="${ISSUES}Self-referencing dependency. "
  elif [ ! -f "backlog/epics/${DEP}.md" ]; then
    ISSUES="${ISSUES}Dependency $DEP does not exist. "
  fi
done

# === METADATA CHECKS ===
if ! grep -q "_generation_metadata:" "$EPIC_FILE"; then
  WARNINGS="${WARNINGS}Missing generation metadata. "
fi

# === OUTPUT ===
if [ -n "$ISSUES" ]; then
  echo "ERROR: ${ISSUES}"
  [ -n "$WARNINGS" ] && echo "Warnings: ${WARNINGS}"
  exit 1
fi

if [ -n "$WARNINGS" ]; then
  echo "OK with warnings: ${WARNINGS}"
else
  echo "OK: Epic verified: $EPIC_ID"
fi
exit 0
```

## Actions on Success

1. Log: "Epic [ID] created successfully"
2. Update: `backlog/epics.json` last_sync timestamp
3. Notify: (if notifications configured)

## Actions on Failure

1. Log: "Epic verification failed: [issues]"
2. Suggest: Remediation steps
3. Do not auto-fix - report to orchestrator

## Output Format

```json
{
  "verified": true,
  "epic_id": "EPIC-001",
  "checks": {
    "file_exists": true,
    "frontmatter_valid": true,
    "index_synced": true,
    "dependencies_valid": true,
    "prd_complete": true,
    "metadata_present": true
  },
  "warnings": []
}
```
