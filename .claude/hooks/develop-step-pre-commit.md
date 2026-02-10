---
event: PreToolUse
matcher: Bash
---

# Development Step Pre-Commit Hook

Validates that a development step is ready for commit during `/develop-task` execution.
Extends commit-validator with TDD-specific checks.

## Trigger Conditions

- Tool: Bash
- Command pattern: Contains `git commit`
- Context: During `/develop-task` execution (detected by development_progress in task file)

## Activation Detection

This hook activates when:
1. A git commit is attempted
2. There's an active task with `development_progress` section
3. The commit message references a TASK-XXX

If no active development context is found, this hook defers to the standard `commit-validator` hook.

## Validation Checks

### 1. TDD Compliance

Check that TDD practices were followed:

```bash
# Check for test file changes in staged files
TEST_FILES=$(git diff --cached --name-only | grep -E '\.(test|spec)\.(ts|tsx|js|jsx|py)$' || true)

if [ -z "$TEST_FILES" ]; then
  echo "WARNING: No test files in commit. TDD requires tests for new functionality."
  # Don't block, but warn
fi
```

### 2. Step Scope Validation

Verify changes match the expected step scope:

```bash
# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only)

# Compare against expected files from step definition
# (This requires reading the implementation plan - may need agent assistance)
```

### 3. Test Status

All tests must pass before commit:

```bash
# Run tests
if [ -f "package.json" ]; then
  npm test --silent
  if [ $? -ne 0 ]; then
    echo "ERROR: Tests failing. Cannot commit during /develop-task."
    echo "Fix tests before committing."
    exit 1
  fi
elif [ -f "pyproject.toml" ] || [ -f "pytest.ini" ]; then
  pytest --quiet
  if [ $? -ne 0 ]; then
    echo "ERROR: Tests failing. Cannot commit during /develop-task."
    exit 1
  fi
fi
```

### 4. Commit Message Format

Validate commit message follows step format:

```bash
COMMIT_MSG="$1"

# Expected format: [TASK-XXX] Step N: description
if ! echo "$COMMIT_MSG" | grep -qE '^\[TASK-[0-9]+\] Step [0-9]+:'; then
  echo "WARNING: Commit message should follow format:"
  echo "[TASK-XXX] Step N: description"
fi
```

## Validation Script

```bash
#!/bin/bash
# Development step pre-commit validator

COMMAND="$1"

# Only validate git commit commands
if [[ ! "$COMMAND" =~ "git commit" ]]; then
  exit 0
fi

# Check for development context
# Look for active task with development_progress
ACTIVE_TASK=$(find ./backlog/tasks -name "TASK-*.md" -exec grep -l "development_progress:" {} \; | head -1)

if [ -z "$ACTIVE_TASK" ]; then
  # No active development, defer to standard commit-validator
  exit 0
fi

echo "Development step commit detected..."

# Check 1: Test files present
TEST_FILES=$(git diff --cached --name-only | grep -E '\.(test|spec)\.(ts|tsx|js|jsx|py)$' || true)
if [ -z "$TEST_FILES" ]; then
  echo "WARNING: No test files staged. TDD requires tests."
fi

# Check 2: Tests pass
if [ -f "package.json" ]; then
  if grep -q '"test"' package.json; then
    echo "Running tests..."
    if ! npm test --silent 2>/dev/null; then
      echo "ERROR: Tests failed. Fix tests before committing."
      exit 1
    fi
    echo "Tests passed."
  fi
elif [ -f "pyproject.toml" ] || [ -f "pytest.ini" ]; then
  echo "Running pytest..."
  if ! pytest --quiet 2>/dev/null; then
    echo "ERROR: Tests failed. Fix tests before committing."
    exit 1
  fi
  echo "Tests passed."
fi

# Check 3: Lint (warning only)
if [ -f "package.json" ]; then
  if grep -q '"lint"' package.json; then
    echo "Running linter..."
    if ! npm run lint --silent 2>/dev/null; then
      echo "WARNING: Lint issues found. Consider fixing."
    fi
  fi
fi

echo "Pre-commit checks passed for development step."
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
    "tdd_compliance": {
      "test_files_staged": true,
      "message": "3 test files in commit"
    },
    "tests_pass": {
      "status": "pass",
      "count": 15,
      "message": "All tests passing"
    },
    "lint": {
      "status": "pass|warn|skip",
      "message": "No lint issues"
    },
    "commit_format": {
      "valid": true,
      "message": "Follows [TASK-XXX] Step N format"
    }
  },
  "context": {
    "active_task": "TASK-001",
    "current_step": 3,
    "development_mode": true
  }
}
```

## Decision Logic

### Allow
- Tests pass
- At least one test file staged (or TDD already satisfied)
- Commit message valid

### Warn (Allow with message)
- Tests pass but no new test files
- Lint has warnings
- Commit message could be improved

### Deny
- Tests fail
- No test framework found and no test files
- Critical lint errors

## On Failure

1. Return deny with specific message
2. List failing tests
3. Suggest fix:
   ```
   Tests failed during development step commit.

   Failing tests:
   - test_login_validation
   - test_form_submission

   Run `npm test` for details.

   Options:
   - Fix tests and try again
   - Use /develop-task to debug
   ```

## Integration

This hook works alongside:
- `commit-validator.md` - Standard commit validation
- `/develop-task` - Provides development context
- `develop-test-verifier` agent - Detailed TDD analysis

## Why This Hook?

During `/develop-task`, commits should be:
1. Atomic (one step per commit)
2. TDD-compliant (tests included)
3. Verified (tests pass)

This hook enforces these constraints at commit time, following the block-at-submit pattern.
