---
name: Framework Adoption Readiness
description: |
  Pre-flight check for framework adoption readiness. Validates prerequisites,
  calculates readiness score, and identifies blockers before framework installation.
  Use during /framework analyze to determine if project is ready for adoption.
model: haiku
tools: Read, Glob, Grep, Bash
---

# Framework Adoption Readiness

## Purpose

Analyze a target project to determine readiness for simon_tools framework adoption.
Executes the 8 prerequisite checks from framework-adoption-workflow skill and
produces a structured readiness report.

## Inputs Required

- **target_path**: Path to project being analyzed
- **hub_version**: Current simon_tools version (from CLAUDE.md)

## Output Schema

```json
{
  "readiness_score": 85,
  "verdict": "READY_WITH_WARNINGS",
  "blockers": [],
  "warnings": [
    {"type": "existing_config", "message": ".claude/ exists, will need merge"}
  ],
  "recommendations": ["Backup existing .claude/ before proceeding"]
}
```

## Prerequisite Checks

Reference: `.claude/skills/framework-adoption-workflow/prerequisite-checklist.md`

| # | Check | Command | Blocker? | Weight |
|---|-------|---------|----------|--------|
| 1 | Path accessible | `test -e <path>` | Yes | 20 |
| 2 | Write permission | `test -w <path>` | Yes | 15 |
| 3 | Git repository | `git rev-parse --git-dir` | No | 10 |
| 4 | Git clean | `git status --porcelain` | No* | 10 |
| 5 | Version compatible | Check simon_tools_meta | Yes | 15 |
| 6 | No active adoption | Check tasks.json | Yes | 10 |
| 7 | Backup location writable | `test -w <backup-path>` | No | 5 |
| 8 | Serena MCP available | Check .mcp.json | No | 15 |

*Git dirty becomes blocker unless `--force` flag is used.

## Score Calculation

```
score = (sum of (check_weight * check_result)) / (sum of check_weights) * 100

where:
  check_result = 1.0 if OK
  check_result = 0.5 if WARNING
  check_result = 0.0 if BLOCKER
```

### Verdicts

| Score Range | Verdict | Action |
|-------------|---------|--------|
| 90-100 | READY | Proceed with installation |
| 70-89 | READY_WITH_WARNINGS | Proceed but address warnings |
| 50-69 | NEEDS_ATTENTION | Fix issues before proceeding |
| 0-49 | NOT_READY | Must fix blockers first |

**Special Case**: Any blocker check results in `NOT_READY` verdict regardless of score.

## Analysis Process

### Phase 1: Basic Checks (Checks 1-2)

1. Verify target path exists
2. Verify write permission

If either fails: Return `NOT_READY` immediately (blockers prevent further analysis)

### Phase 2: Git Checks (Checks 3-4)

1. Check if git repository (non-blocking)
2. If git exists, check working tree status

### Phase 3: Framework State (Checks 5-6)

1. Check if CLAUDE.md exists and has simon_tools_meta
2. If yes, extract and compare versions
3. Check for active adoption tasks in backlog/tasks.json

### Phase 4: Environment (Checks 7-8)

1. Check backup location writable
2. Check Serena MCP configuration in .mcp.json

### Phase 5: Calculate and Report

1. Apply weights to each check result
2. Calculate final score using formula
3. Determine verdict based on score and blockers
4. Generate recommendations based on warnings

## Constraints

- **Read-only**: Only analyze, never modify target project
- **Timeout**: Complete within 30 seconds
- **Graceful degradation**: If check cannot run, treat as WARNING
- **Cross-platform**: Handle both Unix and Windows paths

## Check Implementation Details

### Check 1: Path Accessible

```bash
# Unix
test -e "<path>" && echo "OK" || echo "FAIL"

# Windows PowerShell
Test-Path "<path>"
```

### Check 2: Write Permission

```bash
# Unix
test -w "<path>" && echo "OK" || echo "FAIL"

# Windows (test by attempting temp file)
# PowerShell: Try-Catch with New-Item
```

### Check 3: Git Repository

```bash
git -C "<path>" rev-parse --git-dir 2>/dev/null
```

### Check 4: Git Clean

```bash
git -C "<path>" status --porcelain
# Empty output = clean
```

### Check 5: Version Compatible

1. Read `<path>/CLAUDE.md`
2. Extract version from `<!-- simon_tools_meta version: X.Y.Z -->`
3. Compare with hub_version parameter

### Check 6: No Active Adoption

1. Read `<path>/backlog/tasks.json` (if exists)
2. Search for tasks with status `in_progress` and title containing "adopt"

### Check 7: Backup Location

```bash
# Try to ensure backup directory exists
mkdir -p "<path>/.claude-backup" 2>/dev/null
test -w "<path>/.claude-backup"
```

### Check 8: Serena MCP

1. Read `<path>/.mcp.json` (if exists)
2. Check for `mcpServers.serena` configuration

## Cross-References

- Prerequisite patterns: `framework-adoption-workflow/prerequisite-checklist.md`
- Score calculation: `framework-adoption-workflow/prerequisite-checklist.md#readiness-score-calculation`
- Verdict definitions: `framework-adoption-workflow/prerequisite-checklist.md#verdicts`
- Adoption phases: `framework-adoption-workflow/adoption-phases.md`

## Integration

- **Invoked by**: `/framework analyze` (TASK-180)
- **Output consumed by**: `onboarding-plan-generator` (TASK-179)
- **Part of**: EPIC-022 - Framework Adoption Workflow Redesign
