---
event: PreToolUse
matcher: Write
---

# Working Documents Location Validation

## Purpose

Prevent analysis outputs and working documents from being saved to the project root directory. Enforces the `backlog/working/` convention for temporary development documents.

## Trigger Conditions

- Tool: Write
- Path pattern: Writing `.md` files to project root

## Validation Logic

### 1. Detect Project Root Writes

Check if the target path:
- Is a `.md` file
- Is being written to project root (not in a subdirectory)

### 2. Allowed Exceptions

These files ARE allowed in project root:
- `README.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `LICENSE.md`
- `CODE_OF_CONDUCT.md`
- Any `.md` file that already exists (updates to existing)

### 3. Detection Patterns

**Blocked patterns (new files to project root):**
- `TASK-*.md` (working documents)
- `*-ANALYSIS.md` (analysis outputs)
- `*-SUMMARY.md` (summary documents)
- `*-TEMPLATE.md` (template outputs)
- `*-INDEX.md` (index documents)
- Any new `.md` file not in allowed exceptions

## Validation Script

```bash
#!/bin/bash
# Validate working document locations before write

FILE_PATH="$1"
FILE_NAME=$(basename "$FILE_PATH")
DIR_NAME=$(dirname "$FILE_PATH")

# Only check .md files
if [[ "$FILE_NAME" != *.md ]]; then
  exit 0  # Not an MD file, allow
fi

# Check if this is project root
PROJECT_ROOT=$(pwd)
if [[ "$DIR_NAME" != "$PROJECT_ROOT" && "$DIR_NAME" != "." ]]; then
  exit 0  # Not project root, allow
fi

# Allowed exceptions in project root
ALLOWED_FILES=("README.md" "CLAUDE.md" "CONTRIBUTING.md" "CHANGELOG.md" "LICENSE.md" "CODE_OF_CONDUCT.md")
for allowed in "${ALLOWED_FILES[@]}"; do
  if [[ "$FILE_NAME" == "$allowed" ]]; then
    exit 0  # Allowed file, proceed
  fi
done

# Check if file already exists (updating existing is allowed)
if [[ -f "$FILE_PATH" ]]; then
  exit 0  # Existing file update, allow
fi

# Detect working document patterns
if [[ "$FILE_NAME" =~ ^TASK-.*\.md$ ]] || \
   [[ "$FILE_NAME" =~ .*-ANALYSIS\.md$ ]] || \
   [[ "$FILE_NAME" =~ .*-SUMMARY\.md$ ]] || \
   [[ "$FILE_NAME" =~ .*-TEMPLATE\.md$ ]] || \
   [[ "$FILE_NAME" =~ .*-INDEX\.md$ ]]; then
  echo "ERROR: Working document '$FILE_NAME' should not be saved to project root."
  echo "SUGGESTION: Save to backlog/working/$FILE_NAME instead."
  exit 1
fi

# Generic warning for any new .md file in root
echo "WARN: Creating new .md file '$FILE_NAME' in project root."
echo "If this is a working document, consider saving to backlog/working/ instead."
echo "Allowed root files: README.md, CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE.md"
exit 0  # Warn but allow
```

## Output Format

```json
{
  "decision": {
    "behavior": "allow|warn|deny",
    "message": "Validation result message"
  },
  "suggestion": "Save to backlog/working/[filename] instead"
}
```

## Decision Logic

### Allow (silent)
- File is not `.md`
- File is in a subdirectory (not project root)
- File is an allowed exception (README.md, CLAUDE.md, etc.)
- File already exists (update operation)

### Warn (allow with message)
- New generic `.md` file in project root
- Not a known working document pattern

### Deny (block with error)
- File matches working document pattern:
  - `TASK-*.md`
  - `*-ANALYSIS.md`
  - `*-SUMMARY.md`
  - `*-TEMPLATE.md`
  - `*-INDEX.md`

## On Failure

When a working document is blocked:

```
ERROR: Working document 'TASK-013-ANALYSIS.md' should not be saved to project root.

Working documents should be saved to: backlog/working/
Suggested path: backlog/working/TASK-013-ANALYSIS.md

Allowed files in project root:
- README.md
- CLAUDE.md
- CONTRIBUTING.md
- CHANGELOG.md
- LICENSE.md
- CODE_OF_CONDUCT.md
```

## Convention Reference

From CLAUDE.md v0.20.0:
- Working documents go in `backlog/working/`
- Naming convention: `TASK-XXX-[description].md`
- Clean up after task completion
- Project root should remain clean

## Examples

### Blocked (working document)
```
Path: TASK-013-SEO-ANALYSIS.md
Result: DENY
Message: Save to backlog/working/TASK-013-SEO-ANALYSIS.md instead
```

### Allowed (standard file)
```
Path: README.md
Result: ALLOW (silent)
```

### Allowed (subdirectory)
```
Path: backlog/working/TASK-013-ANALYSIS.md
Result: ALLOW (correct location)
```

### Warn (unknown .md in root)
```
Path: my-notes.md
Result: WARN
Message: Consider saving to backlog/working/ if this is a working document
```
