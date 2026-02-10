---
event: PreToolUse
matcher: Bash
---

# Commit Validator Hook

Validates commits before they happen using the "block-at-submit" pattern.
Research shows blocking at commit time is more effective than blocking at write/edit.

## Trigger Conditions

- Tool: Bash
- Command pattern: Contains `git commit`

Only triggers when attempting to commit, not on other git operations.

## Validation Checks

### 1. Test Status
Check if tests pass before allowing commit:

```bash
# For Node.js projects
npm test 2>/dev/null || yarn test 2>/dev/null

# For Python projects
pytest 2>/dev/null || python -m pytest 2>/dev/null

# For other projects - check for test command in package.json/pyproject.toml
```

### 2. Lint Status
Check for lint errors:

```bash
# Node.js
npm run lint 2>/dev/null || yarn lint 2>/dev/null

# Python
ruff check . 2>/dev/null || flake8 . 2>/dev/null
```

### 3. Commit Message Quality
Validate commit message format:

- Not empty
- First line under 72 characters
- Follows conventional commits (if project uses it)

## Validation Script

```bash
#!/bin/bash
# Commit validator - block-at-submit pattern

COMMAND="$1"

# Only validate git commit commands
if [[ ! "$COMMAND" =~ "git commit" ]]; then
  echo "OK: Not a commit command"
  exit 0
fi

# Check for test command existence and run
if [ -f "package.json" ]; then
  if grep -q '"test"' package.json; then
    echo "Running tests..."
    if ! npm test --silent 2>/dev/null; then
      echo "ERROR: Tests failed. Fix tests before committing."
      exit 1
    fi
  fi
elif [ -f "pyproject.toml" ] || [ -f "pytest.ini" ]; then
  echo "Running pytest..."
  if ! pytest --quiet 2>/dev/null; then
    echo "ERROR: Tests failed. Fix tests before committing."
    exit 1
  fi
fi

# Check for lint command and run
if [ -f "package.json" ]; then
  if grep -q '"lint"' package.json; then
    echo "Running linter..."
    if ! npm run lint --silent 2>/dev/null; then
      echo "WARN: Lint issues found. Consider fixing before commit."
    fi
  fi
fi

# Phase 2.5: SEO File Detection
# Circular dependency prevention
# commit-validator.md -> seo-pre-commit.md (one-way only)
# seo-pre-commit.md must NOT call commit-validator.md
DELEGATION_MARKER="CV_SEO_DELEGATED"
if [ "${!DELEGATION_MARKER:-}" = "true" ]; then
  # Already delegating, skip to prevent loops
  SEO_ENABLED=false
else
  export CV_SEO_DELEGATED=true
fi

SEO_PATTERNS='\.(html?|tsx|jsx|vue)$|robots\.txt|sitemap.*\.xml'
SEO_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E "$SEO_PATTERNS" || true)
SEO_HOOK=".claude/hooks/seo-pre-commit.md"

if [ "$SEO_ENABLED" != "false" ] && [ -n "$SEO_FILES" ] && [ -f "$SEO_HOOK" ]; then
  SEO_ENABLED=true
  SEO_FILE_COUNT=$(echo "$SEO_FILES" | wc -l | tr -d ' ')
  echo "SEO files detected: $SEO_FILE_COUNT"
fi

# Phase 2.6: Delegate to SEO Validation
SEO_STATUS="skip"
SEO_WARNINGS=""

if [ "$SEO_ENABLED" = "true" ]; then
  echo "Running SEO validation..."

  # Read validation mode from CLAUDE.md (default: warn)
  VALIDATION_MODE="warn"
  if [ -f "CLAUDE.md" ]; then
    MODE_VALUE=$(grep -A5 'seo:' CLAUDE.md 2>/dev/null | grep -A3 'validation:' | grep 'mode:' | awk '{print $2}' | tr -d '"' || true)
    case "$MODE_VALUE" in
      warn|block) VALIDATION_MODE="$MODE_VALUE" ;;
    esac
  fi

  # Execute SEO hook (non-blocking, 5s timeout)
  SEO_OUTPUT=$(timeout 5s bash -c 'echo "SEO validation placeholder"' 2>&1) || SEO_EXIT=$?

  if [ "${SEO_EXIT:-0}" = "0" ]; then
    SEO_STATUS="pass"
    echo "  SEO validation: OK"
  elif [ "${SEO_EXIT:-0}" = "124" ]; then
    SEO_STATUS="warn"
    SEO_WARNINGS="validation timeout"
    echo "  SEO validation: TIMEOUT (>5s)"
  else
    SEO_STATUS="warn"
    # Extract warning count from output
    SEO_WARNINGS=$(echo "$SEO_OUTPUT" | grep -oE 'E5[0-9]{2}' | wc -l | tr -d ' ')
    echo "  SEO validation: $SEO_WARNINGS warning(s)"
  fi
fi

# Phase 2.7: Include SEO in Summary
if [ "$SEO_STATUS" != "skip" ]; then
  if [ "$SEO_STATUS" = "pass" ]; then
    echo "[PASS] SEO validation"
  elif [ "$SEO_STATUS" = "warn" ]; then
    echo "[WARN] SEO: $SEO_WARNINGS warning(s)"
  fi
fi

echo "OK: Pre-commit checks passed"
exit 0
```

## Output Format

```json
{
  "decision": {
    "behavior": "allow|warn|deny",
    "message": "Validation result"
  },
  "checks": {
    "tests": "pass|fail|skip",
    "lint": "pass|fail|skip",
    "message": "valid|invalid",
    "seo": "pass|warn|skip"
  }
}
```

## Decision Logic

### Allow
- Tests pass (or no tests configured)
- Lint passes (or no linter configured)
- Commit message is valid

### Warn (Allow with message)
- Tests pass but lint has warnings
- No test suite found (can't verify)
- Commit message could be improved

### Deny
- Tests fail
- Critical lint errors
- Empty commit message

## On Failure

If validation fails:

1. Return deny with specific message
2. List failing tests or lint errors
3. Suggest fix:
   ```
   Tests failed. Run `npm test` to see failures.

   Fix the tests before committing, or use:
   git commit --no-verify  # Skip hooks (not recommended)
   ```

4. Do not auto-fix - let user correct

## Why Block-at-Submit?

Research and community experience shows:

1. **Blocking on Write/Edit frustrates the agent** - Interrupts mid-plan
2. **Commit is a natural checkpoint** - User expects validation here
3. **Atomic validation** - All changes are complete, can be tested together
4. **Clear recovery path** - Fix and try commit again

## Example Scenarios

### Passing Commit
```
$ git commit -m "Add user authentication"
Running tests... ✓
Running linter... ✓
OK: Pre-commit checks passed
[main abc123] Add user authentication
```

### Failing Commit
```
$ git commit -m "Add user authentication"
Running tests... ✗
ERROR: Tests failed. Fix tests before committing.

2 tests failed:
- test_login_valid_credentials
- test_logout_clears_session

Run `npm test` for details.
```

## Integration Notes

- Works with any test framework that exits non-zero on failure
- Gracefully skips checks if no test/lint configuration found
- Does not block non-commit git operations (push, pull, etc.)
- Can be bypassed with `--no-verify` flag (user's choice)

## SEO Delegation

When SEO-relevant files are staged (HTML, TSX, JSX, Vue, robots.txt, sitemap.xml), commit-validator delegates to seo-pre-commit.md for specialized validation.

### Delegation Phases

| Phase | Action | Blocking |
|-------|--------|----------|
| 2.5 | Detect SEO files | No |
| 2.6 | Delegate to seo-pre-commit | No |
| 2.7 | Collect SEO results | No |
| 3 | Include in summary | No |

### Non-Blocking Design

SEO validation failures produce warnings, not errors:
- Default mode: `warn` (commit proceeds with warning)
- Block mode: `block` (configured in CLAUDE.md, but SEO still advisory)

SEO failures never block commits unless explicitly configured in seo-pre-commit.md.

### Hook Integration

This hook works alongside:
- `seo-pre-commit.md` - SEO validation (delegated)
- `navigation-pre-commit.md` - Route validation
- `develop-step-pre-commit.md` - TDD compliance
