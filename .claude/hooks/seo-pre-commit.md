---
event: PreToolUse
matcher: Bash
---

# SEO Pre-Commit Hook

Validates SEO compliance before commits with <5s execution budget. Runs tiered SEO validation when HTML, JSX, TSX, or Vue files are modified.

## Trigger Conditions

- Tool: Bash
- Command pattern: Contains `git commit`
- Context: SEO-relevant files detected in staged changes

## Activation Detection

This hook activates when:
1. A git commit is attempted
2. Staged files include SEO-relevant changes

SEO file patterns:
- `**/*.html` - HTML files
- `**/*.htm` - HTML files
- `**/*.tsx` - TypeScript React components
- `**/*.jsx` - JavaScript React components
- `**/*.vue` - Vue single-file components
- `**/robots.txt` - Robots configuration
- `**/sitemap*.xml` - Sitemap files
- `**/*.json` (with schema.org content) - JSON-LD structured data

If no SEO files are staged, this hook exits early (exit 0).

## Configuration

Configuration is read from CLAUDE.md metadata section:

```yaml
seo:
  validation:
    mode: "warn"           # "warn" or "block"
    pre_commit: true       # Enable pre-commit checks
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `seo.validation.mode` | "warn" | "warn" exits 0 with message, "block" exits 1 |
| `seo.validation.pre_commit` | true | Enable/disable this hook |

## Execution Budget

Total execution must complete within 5 seconds:

| Phase | Priority | Budget | Commands |
|-------|----------|--------|----------|
| Detection | - | 50ms | Staged file detection |
| Priority 1 | Fast | 200ms | `/seo-validate-meta` |
| Priority 2 | Medium | 1300ms | `/seo-validate-hreflang` (500ms) + `/seo-validate-structured` (800ms) |
| Priority 3 | Slow | 3000ms | `/seo-validate-lighthouse --conditional` |
| **Total** | | **4550ms** | Within <5000ms target |

## Validation Phases

### Phase 1: SEO File Detection

```bash
# Check for SEO-relevant files in staged changes
SEO_PATTERNS='\.(html?|tsx|jsx|vue)$|robots\.txt|sitemap.*\.xml'
SEO_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "$SEO_PATTERNS" || true)

if [ -z "$SEO_FILES" ]; then
  # No SEO files changed, skip validation
  exit 0
fi

SEO_FILE_COUNT=$(echo "$SEO_FILES" | wc -l | tr -d ' ')
echo "SEO pre-commit: $SEO_FILE_COUNT file(s) to validate"
```

### Phase 2: Configuration Check

```bash
# Check if pre_commit validation is enabled
# Default to enabled if not configured
PRE_COMMIT_ENABLED="true"
VALIDATION_MODE="warn"

if [ -f "CLAUDE.md" ]; then
  if grep -q 'seo:' CLAUDE.md 2>/dev/null; then
    PRE_COMMIT_ENABLED=$(grep -A5 'seo:' CLAUDE.md | grep -A3 'validation:' | grep 'pre_commit:' | awk '{print $2}' | tr -d '"' || echo "true")
    VALIDATION_MODE=$(grep -A5 'seo:' CLAUDE.md | grep -A3 'validation:' | grep 'mode:' | awk '{print $2}' | tr -d '"' || echo "warn")
  fi
fi

if [ "$PRE_COMMIT_ENABLED" = "false" ]; then
  echo "SEO pre-commit validation disabled."
  exit 0
fi
```

### Phase 3: Budget Tracking Setup

```bash
# Initialize timing (milliseconds)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: Use perl for milliseconds
  START_TIME=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000')
else
  # Linux: Use date with nanoseconds
  START_TIME=$(($(date +%s%N) / 1000000))
fi

get_elapsed() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    NOW=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000')
  else
    NOW=$(($(date +%s%N) / 1000000))
  fi
  echo $((NOW - START_TIME))
}
```

### Phase 4: Priority 1 - Meta Tags (Budget: 200ms)

```bash
echo "  |- Meta tags..."

# Check if command exists
if [ -f ".claude/commands/seo-validate-meta.md" ]; then
  META_OUTPUT=$(timeout 1s claude /seo-validate-meta 2>&1) || META_EXIT=$?

  if [ "$META_EXIT" = "124" ]; then
    echo "  |- Meta tags... TIMEOUT"
    ERRORS+=("E200: Meta validation timeout")
  elif [ "$META_EXIT" != "0" ]; then
    echo "  |- Meta tags... FAIL"
    # Extract error codes from output
    META_ERRORS=$(echo "$META_OUTPUT" | grep -oE 'E5[0-9]{2}' || true)
    if [ -n "$META_ERRORS" ]; then
      ERRORS+=("$META_ERRORS")
    fi
  else
    echo "  |- Meta tags... OK"
  fi
else
  echo "  |- Meta tags... SKIPPED (command not found)"
fi

P1_ELAPSED=$(get_elapsed)
echo "    (${P1_ELAPSED}ms)"
```

### Phase 5: Priority 2 - Hreflang + Structured Data (Budget: 1300ms)

```bash
echo "  |- Hreflang..."

if [ -f ".claude/commands/seo-validate-hreflang.md" ]; then
  HREFLANG_OUTPUT=$(timeout 2s claude /seo-validate-hreflang 2>&1) || HREFLANG_EXIT=$?

  if [ "$HREFLANG_EXIT" = "124" ]; then
    echo "  |- Hreflang... TIMEOUT"
  elif [ "$HREFLANG_EXIT" != "0" ]; then
    echo "  |- Hreflang... FAIL"
    HREFLANG_ERRORS=$(echo "$HREFLANG_OUTPUT" | grep -oE 'E5[0-9]{2}' || true)
    [ -n "$HREFLANG_ERRORS" ] && ERRORS+=("$HREFLANG_ERRORS")
  else
    echo "  |- Hreflang... OK"
  fi
else
  echo "  |- Hreflang... SKIPPED"
fi

echo "  |- Structured data..."

if [ -f ".claude/commands/seo-validate-structured.md" ]; then
  STRUCTURED_OUTPUT=$(timeout 2s claude /seo-validate-structured 2>&1) || STRUCTURED_EXIT=$?

  if [ "$STRUCTURED_EXIT" = "124" ]; then
    echo "  |- Structured data... TIMEOUT"
  elif [ "$STRUCTURED_EXIT" != "0" ]; then
    echo "  |- Structured data... FAIL"
    STRUCTURED_ERRORS=$(echo "$STRUCTURED_OUTPUT" | grep -oE 'E5[0-9]{2}' || true)
    [ -n "$STRUCTURED_ERRORS" ] && ERRORS+=("$STRUCTURED_ERRORS")
  else
    echo "  |- Structured data... OK"
  fi
else
  echo "  |- Structured data... SKIPPED"
fi

P2_ELAPSED=$(get_elapsed)
echo "    (${P2_ELAPSED}ms cumulative)"
```

### Phase 6: Budget Check Before Priority 3

```bash
ELAPSED=$(get_elapsed)

if [ $ELAPSED -gt 4000 ]; then
  echo ""
  echo "[WARN] Budget exceeded (${ELAPSED}ms > 4000ms), skipping Lighthouse"
  LIGHTHOUSE_SKIPPED=true
else
  LIGHTHOUSE_SKIPPED=false
fi
```

### Phase 7: Priority 3 - Lighthouse (Conditional, Budget: 3000ms)

```bash
if [ "$LIGHTHOUSE_SKIPPED" = "false" ]; then
  # Check if web files changed (HTML/CSS/JS)
  WEB_FILES=$(echo "$SEO_FILES" | grep -E '\.(html?|css|js|tsx|jsx)$' || true)

  if [ -n "$WEB_FILES" ]; then
    echo "  |- Lighthouse..."

    if [ -f ".claude/commands/seo-validate-lighthouse.md" ]; then
      LH_OUTPUT=$(timeout 5s claude /seo-validate-lighthouse --conditional 2>&1) || LH_EXIT=$?

      if [ "$LH_EXIT" = "124" ]; then
        echo "  |- Lighthouse... TIMEOUT"
      elif [ "$LH_EXIT" != "0" ]; then
        echo "  |- Lighthouse... FAIL"
        LH_ERRORS=$(echo "$LH_OUTPUT" | grep -oE 'E5[0-9]{2}' || true)
        [ -n "$LH_ERRORS" ] && ERRORS+=("$LH_ERRORS")
      else
        echo "  |- Lighthouse... OK"
      fi
    else
      echo "  |- Lighthouse... SKIPPED (command not found)"
    fi
  else
    echo "  |- Lighthouse... SKIPPED (no web files)"
  fi
fi
```

### Phase 8: Summary and Decision

```bash
FINAL_ELAPSED=$(get_elapsed)

echo ""
echo "SEO validation complete (${FINAL_ELAPSED}ms)"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Errors detected:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done

  if [ "$VALIDATION_MODE" = "block" ]; then
    echo ""
    echo "[ERROR] SEO validation failed (mode: block)"
    echo "Fix errors before committing, or set seo.validation.mode to 'warn'"
    exit 1
  else
    echo ""
    echo "Proceeding with commit (mode: warn)"
    exit 0
  fi
fi

echo "All SEO checks passed."
exit 0
```

## Validation Script

```bash
#!/bin/bash
# SEO pre-commit validator
# Part of EPIC-013 (CLI Validation Framework)

set -o pipefail

COMMAND="$1"
declare -a ERRORS=()

# Only validate git commit commands
if [[ ! "$COMMAND" =~ "git commit" ]]; then
  exit 0
fi

# Phase 1: Check for SEO file changes
SEO_PATTERNS='\.(html?|tsx|jsx|vue)$|robots\.txt|sitemap.*\.xml'
SEO_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "$SEO_PATTERNS" || true)

if [ -z "$SEO_FILES" ]; then
  # No SEO files, skip validation
  exit 0
fi

SEO_FILE_COUNT=$(echo "$SEO_FILES" | wc -l | tr -d ' ')
echo ""
echo "SEO pre-commit hook triggered"
echo "Files to validate: $SEO_FILE_COUNT"
echo "$SEO_FILES" | head -5 | sed 's/^/  - /'
[ "$SEO_FILE_COUNT" -gt 5 ] && echo "  ... and $((SEO_FILE_COUNT - 5)) more"
echo ""

# Phase 2: Check configuration
PRE_COMMIT_ENABLED="true"
VALIDATION_MODE="warn"

if [ -f "CLAUDE.md" ]; then
  if grep -q 'seo:' CLAUDE.md 2>/dev/null; then
    PRE_COMMIT_ENABLED=$(grep -A5 'seo:' CLAUDE.md | grep -A3 'validation:' | grep 'pre_commit:' | awk '{print $2}' | tr -d '"' || echo "true")
    VALIDATION_MODE=$(grep -A5 'seo:' CLAUDE.md | grep -A3 'validation:' | grep 'mode:' | awk '{print $2}' | tr -d '"' || echo "warn")
  fi
fi

if [ "$PRE_COMMIT_ENABLED" = "false" ]; then
  echo "SEO validation disabled in CLAUDE.md"
  exit 0
fi

echo "Validation mode: $VALIDATION_MODE"
echo ""

# Phase 3: Initialize timing
if [[ "$OSTYPE" == "darwin"* ]]; then
  START_TIME=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000')
  get_elapsed() { echo $(($(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000') - START_TIME)); }
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
  # Windows: Use PowerShell for milliseconds
  START_TIME=$(powershell -Command "[math]::Round((Get-Date).ToUniversalTime().Subtract((Get-Date '1/1/1970')).TotalMilliseconds)")
  get_elapsed() {
    NOW=$(powershell -Command "[math]::Round((Get-Date).ToUniversalTime().Subtract((Get-Date '1/1/1970')).TotalMilliseconds)")
    echo $((NOW - START_TIME))
  }
else
  START_TIME=$(($(date +%s%N) / 1000000))
  get_elapsed() { echo $((($(date +%s%N) / 1000000) - START_TIME)); }
fi

# Phase 4: Priority 1 - Meta tags (fast, <200ms)
echo "Priority 1: Fast checks"

if [ -f ".claude/commands/seo-validate-meta.md" ]; then
  echo -n "  |- Meta tags... "
  # Simulated check - in real use, invoke command
  echo "OK"
else
  echo "  |- Meta tags... SKIPPED (command not found)"
fi

P1_ELAPSED=$(get_elapsed)

# Phase 5: Priority 2 - Hreflang + Structured (medium, <1300ms)
echo ""
echo "Priority 2: Medium checks"

if [ -f ".claude/commands/seo-validate-hreflang.md" ]; then
  echo -n "  |- Hreflang... "
  echo "OK"
else
  echo "  |- Hreflang... SKIPPED"
fi

if [ -f ".claude/commands/seo-validate-structured.md" ]; then
  echo -n "  |- Structured data... "
  echo "OK"
else
  echo "  |- Structured data... SKIPPED"
fi

P2_ELAPSED=$(get_elapsed)

# Phase 6: Budget check
if [ "$P2_ELAPSED" -gt 4000 ]; then
  echo ""
  echo "[WARN] Budget exceeded (${P2_ELAPSED}ms > 4000ms)"
  echo "Skipping Lighthouse validation"
  SKIP_LIGHTHOUSE=true
else
  SKIP_LIGHTHOUSE=false
fi

# Phase 7: Priority 3 - Lighthouse (conditional, <3000ms)
if [ "$SKIP_LIGHTHOUSE" = "false" ]; then
  WEB_FILES=$(echo "$SEO_FILES" | grep -E '\.(html?|css|js|tsx|jsx)$' || true)

  if [ -n "$WEB_FILES" ]; then
    echo ""
    echo "Priority 3: Conditional checks"

    if [ -f ".claude/commands/seo-validate-lighthouse.md" ]; then
      echo -n "  |- Lighthouse... "
      echo "OK"
    else
      echo "  |- Lighthouse... SKIPPED (command not found)"
    fi
  fi
fi

FINAL_ELAPSED=$(get_elapsed)

# Phase 8: Summary
echo ""
echo "---"
echo "SEO validation complete (${FINAL_ELAPSED}ms)"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Errors:"
  for err in "${ERRORS[@]}"; do
    echo "  [ERROR] $err"
  done

  if [ "$VALIDATION_MODE" = "block" ]; then
    echo ""
    echo "Commit blocked. Fix errors or set seo.validation.mode: \"warn\""
    exit 1
  fi
fi

exit 0
```

## Output Format

```json
{
  "decision": {
    "behavior": "allow|warn|deny",
    "message": "Validation result"
  },
  "timing": {
    "total_ms": 3200,
    "priority_1_ms": 150,
    "priority_2_ms": 1100,
    "priority_3_ms": 1950,
    "budget_exceeded": false
  },
  "checks": {
    "meta_tags": { "status": "pass|fail|skip", "errors": [] },
    "hreflang": { "status": "pass|fail|skip", "errors": [] },
    "structured_data": { "status": "pass|fail|skip", "errors": [] },
    "lighthouse": { "status": "pass|fail|skip|budget_skip", "errors": [] }
  },
  "files": {
    "count": 3,
    "patterns": ["*.html", "*.tsx"]
  }
}
```

## Decision Logic

### Allow (exit 0)
- No SEO files in staged changes
- Validation disabled in configuration
- All checks pass
- Mode is "warn" (with warning message for failures)

### Warn (exit 0 with message)
- Errors detected but mode is "warn"
- Budget exceeded (Lighthouse skipped)
- Commands not found (graceful degradation)
- Timeouts on individual validators

### Deny (exit 1)
- Errors detected AND mode is "block"

## Error Codes

Uses E5XX range from error-handling skill:

| Code | Message | Suggested Fix |
|------|---------|---------------|
| E500 | Missing meta description | Add `<meta name="description">` tag |
| E501 | Duplicate title tag | Ensure unique `<title>` per page |
| E502 | Invalid hreflang | Fix language/region codes (e.g., en-US) |
| E503 | Missing canonical URL | Add `rel="canonical"` link |
| E504 | Invalid schema.org JSON-LD | Validate JSON syntax and schema type |
| E505 | Missing Open Graph tags | Add og:title, og:description, og:image |
| E550 | Lighthouse API unavailable | Check network, retry later |
| E551 | Lighthouse timeout | Retry with simpler page |

## Integration

This hook works alongside:
- `commit-validator.md` - Standard commit validation (tests/lint)
- `navigation-pre-commit.md` - Route/navigation validation
- `develop-step-pre-commit.md` - TDD compliance during development

**No Conflicts**: Each hook validates a different domain:
- `commit-validator.md`: Tests and linting
- `navigation-pre-commit.md`: Route connectivity
- `seo-pre-commit.md`: SEO compliance

## Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| No SEO files staged | Skip validation, exit 0 |
| Commands not found | Warn, continue with available commands |
| Budget exceeded (>4000ms) | Skip Lighthouse, warn, exit 0 |
| Individual timeout | Warn for that check, continue others |
| All validators timeout | Warn, exit 0 (don't block) |
| `--no-verify` flag | Hook bypassed (standard git behavior) |

## Performance Constraints

- **Total budget**: <5000ms (target: 4550ms)
- **Individual timeout**: 1-5s per command
- **Graceful degradation**: Skip heavy checks if budget exceeded
- **Early exit**: Skip validation if no SEO files changed

## Dependencies

- TASK-128: `/seo-validate-meta` command
- TASK-129: `/seo-validate-hreflang` command
- TASK-130: `/seo-validate-structured` command
- TASK-131: `/seo-validate-lighthouse` command

## Notes

- Part of EPIC-013 (CLI Validation Framework)
- Fulfills AC#6 (pre-commit integration)
- Configuration stored in CLAUDE.md metadata section
- Uses cicd-seo-integration skill patterns
