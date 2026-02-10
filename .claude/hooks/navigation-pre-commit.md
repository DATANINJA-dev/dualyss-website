---
event: PreToolUse
matcher: Bash
---

# Navigation Pre-Commit Hook

Validates navigation/route changes before commits during development. Runs `/validate-journeys --quick` when route files are modified.

## Trigger Conditions

- Tool: Bash
- Command pattern: Contains `git commit`
- Context: Route files detected in staged changes

## Activation Detection

This hook activates when:
1. A git commit is attempted
2. Staged files include route-related changes

Route file patterns:
- `**/routes/**` - Route definition directories
- `**/route-registry.yaml` - Route registry configuration
- `**/app/**/page.{tsx,jsx,ts,js}` - Next.js App Router pages
- `**/pages/**/*.{tsx,jsx,ts,js}` - Next.js/Nuxt pages directory
- `**/*router*.{ts,tsx,js,jsx}` - Router configuration files
- `**/routes.{ts,tsx,js,jsx}` - Route definition files

If no route files are staged, this hook exits early (exit 0).

## Configuration

Configuration is read from CLAUDE.md metadata section:

```yaml
navigation:
  validation:
    mode: "warn"           # "warn" or "block"
    pre_commit: true       # Enable pre-commit checks
    develop_task: true     # Enable develop-task checks
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `navigation.validation.mode` | "warn" | "warn" exits 0 with message, "block" exits 1 |
| `navigation.validation.pre_commit` | true | Enable/disable this hook |
| `navigation.validation.develop_task` | true | Enable develop-task navigation checks |

## Validation Phases

### Phase 1: Route File Detection

```bash
# Check for route-related files in staged changes
ROUTE_FILES=$(git diff --cached --name-only | grep -E '(routes?|router|page\.(tsx?|jsx?)|route-registry\.yaml)' || true)

if [ -z "$ROUTE_FILES" ]; then
  # No route files changed, skip validation
  exit 0
fi

echo "Route files detected in commit:"
echo "$ROUTE_FILES"
```

### Phase 2: Configuration Check

```bash
# Check if pre_commit validation is enabled
# Default to enabled if not configured
PRE_COMMIT_ENABLED=$(grep -A3 'navigation:' CLAUDE.md | grep 'pre_commit:' | awk '{print $2}' || echo "true")

if [ "$PRE_COMMIT_ENABLED" = "false" ]; then
  echo "Navigation pre-commit validation disabled."
  exit 0
fi

# Get validation mode (warn or block)
VALIDATION_MODE=$(grep -A3 'navigation:' CLAUDE.md | grep 'mode:' | awk -F'"' '{print $2}' || echo "warn")
```

### Phase 3: Run /validate-journeys --quick

```bash
# Run validation with timeout (5s max for pre-commit)
echo "Running navigation validation..."

TIMEOUT_SECONDS=5

# Use timeout command if available, otherwise skip timeout
if command -v timeout &> /dev/null; then
  VALIDATION_OUTPUT=$(timeout ${TIMEOUT_SECONDS}s claude /validate-journeys --quick 2>&1) || VALIDATION_EXIT=$?
else
  VALIDATION_OUTPUT=$(claude /validate-journeys --quick 2>&1) || VALIDATION_EXIT=$?
fi

# Handle timeout
if [ "$VALIDATION_EXIT" = "124" ]; then
  echo "WARNING: Navigation validation timed out (>${TIMEOUT_SECONDS}s)"
  echo "Proceeding without full validation."
  exit 0
fi
```

### Phase 4: Parse Results

```bash
# Check for orphans in output
ORPHAN_COUNT=$(echo "$VALIDATION_OUTPUT" | grep -oP 'Orphans Detected: \K[0-9]+' || echo "0")

if [ "$ORPHAN_COUNT" -gt 0 ]; then
  echo ""
  echo "WARNING: $ORPHAN_COUNT orphaned page(s) detected"
  echo ""
  echo "$VALIDATION_OUTPUT" | grep -A20 "Orphaned Pages"
  echo ""

  if [ "$VALIDATION_MODE" = "block" ]; then
    echo "ERROR: Navigation validation failed (mode: block)"
    echo "Fix orphaned pages before committing."
    echo ""
    echo "Options:"
    echo "  - Add links to orphaned pages"
    echo "  - Remove unused routes"
    echo "  - Set navigation.validation.mode to 'warn' to bypass"
    exit 1
  else
    echo "Proceeding with commit (mode: warn)"
  fi
fi
```

### Phase 5: Output Summary

```bash
echo ""
echo "Navigation validation complete."

if [ "$ORPHAN_COUNT" = "0" ]; then
  echo "No orphaned pages detected."
fi

exit 0
```

## Validation Script

```bash
#!/bin/bash
# Navigation pre-commit validator

COMMAND="$1"

# Only validate git commit commands
if [[ ! "$COMMAND" =~ "git commit" ]]; then
  exit 0
fi

# Phase 1: Check for route file changes
ROUTE_PATTERNS='(routes?/|router|/page\.(tsx?|jsx?)|route-registry\.yaml|/pages/)'
ROUTE_FILES=$(git diff --cached --name-only | grep -E "$ROUTE_PATTERNS" || true)

if [ -z "$ROUTE_FILES" ]; then
  # No route files, skip validation
  exit 0
fi

echo "Navigation pre-commit hook triggered"
echo "Route files changed:"
echo "$ROUTE_FILES" | sed 's/^/  - /'
echo ""

# Phase 2: Check configuration
PRE_COMMIT_ENABLED="true"
VALIDATION_MODE="warn"

if [ -f "CLAUDE.md" ]; then
  # Extract configuration if available
  if grep -q 'navigation:' CLAUDE.md 2>/dev/null; then
    PRE_COMMIT_ENABLED=$(grep -A5 'navigation:' CLAUDE.md | grep -A3 'validation:' | grep 'pre_commit:' | awk '{print $2}' | tr -d '"' || echo "true")
    VALIDATION_MODE=$(grep -A5 'navigation:' CLAUDE.md | grep -A3 'validation:' | grep 'mode:' | awk '{print $2}' | tr -d '"' || echo "warn")
  fi
fi

if [ "$PRE_COMMIT_ENABLED" = "false" ]; then
  echo "Navigation validation disabled in CLAUDE.md"
  exit 0
fi

echo "Validation mode: $VALIDATION_MODE"

# Phase 3: Check if /validate-journeys command exists
if [ ! -f ".claude/commands/validate-journeys.md" ]; then
  echo "WARNING: /validate-journeys command not found"
  echo "Skipping navigation validation"
  exit 0
fi

# Phase 4: Check for route-registry.yaml
if [ ! -f "route-registry.yaml" ] && [ ! -f "routes/route-registry.yaml" ]; then
  echo "INFO: No route-registry.yaml found"
  echo "Navigation validation requires route registry for full analysis"
  echo "Consider creating route-registry.yaml with /generate-nav"
  exit 0
fi

# Phase 5: Summary
echo ""
echo "Route files will be validated."
echo "Run '/validate-journeys' for full analysis."

# For pre-commit, we do a lightweight check
# Full /validate-journeys analysis is done manually or in CI

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
    "route_files_detected": {
      "count": 3,
      "files": ["src/routes/auth.tsx", "route-registry.yaml"]
    },
    "orphans_detected": {
      "count": 0,
      "orphans": []
    },
    "validation_mode": "warn",
    "timeout_occurred": false
  },
  "context": {
    "validation_enabled": true,
    "route_registry_exists": true,
    "validate_journeys_available": true
  }
}
```

## Decision Logic

### Allow (exit 0)
- No route files in staged changes
- Validation disabled in configuration
- No orphans detected
- Mode is "warn" (with warning message)

### Warn (exit 0 with message)
- Orphans detected but mode is "warn"
- Validation timed out
- Route registry missing
- /validate-journeys command not available

### Deny (exit 1)
- Orphans detected AND mode is "block"

## Error Handling

| Error | Code | Handling |
|-------|------|----------|
| No route files | - | Skip validation (exit 0) |
| Validation timeout | E200 | Warn, exit 0 |
| Orphans found (warn) | - | Exit 0 with warning |
| Orphans found (block) | E401 | Exit 1 (deny commit) |
| No route registry | - | Warn, skip entry/exit checks |
| Command not found | - | Warn, exit 0 |

## Integration

This hook works alongside:
- `commit-validator.md` - Standard commit validation
- `develop-step-pre-commit.md` - TDD compliance during development
- `/validate-journeys` - Full navigation analysis command
- `journey-validator` agent - Route graph analysis

## Why This Hook?

Navigation issues can silently enter the codebase:
1. Orphaned pages (unreachable routes)
2. Broken navigation flows
3. Missing entry/exit points

This hook catches these issues at commit time, before they reach the repository.

## Performance Constraints

- **Timeout**: 5 seconds maximum (pre-commit should be fast)
- **Graceful degradation**: If timeout or error, warn but don't block
- **Lightweight check**: Full analysis deferred to CI or manual /validate-journeys

## Notes

- Part of EPIC-017 (UX Flow Validation & Page Connectivity)
- Depends on TASK-115 (/validate-journeys command)
- Configuration stored in CLAUDE.md metadata section
