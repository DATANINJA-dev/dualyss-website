# Prerequisite Checklist

Pre-adoption validation checks that determine readiness before creating an adoption task. These checks run during Phase 1 (Analyze) of the [adoption workflow](adoption-phases.md).

## Checklist Overview

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

## Check Details

### 1. Path Accessible

**Command**:
```bash
# Unix
test -e "<path>" && echo "OK" || echo "FAIL"

# Windows
if exist "<path>" (echo OK) else (echo FAIL)
```

**Verdict**:
- OK: Path exists
- FAIL: Path not found (BLOCKER)

**Error Message**:
```
[BLOCKER] Path not found: <path>

The specified path does not exist. Please verify:
- Path is spelled correctly
- Path is relative to current working directory
- Or use absolute path
```

### 2. Write Permission

**Command**:
```bash
# Unix
test -w "<path>" && echo "OK" || echo "FAIL"

# Windows (PowerShell)
(Get-Acl "<path>").Access | Where-Object { $_.FileSystemRights -match "Write" }
```

**Verdict**:
- OK: Write permission granted
- FAIL: No write permission (BLOCKER)

**Error Message**:
```
[BLOCKER] No write permission: <path>

Cannot write to the target directory. Try:
- Run with elevated permissions (sudo/admin)
- Check directory ownership
- Verify not on read-only filesystem
```

### 3. Git Repository

**Command**:
```bash
git -C "<path>" rev-parse --git-dir 2>/dev/null
```

**Verdict**:
- OK: Git repository detected
- WARNING: Not a git repository (non-blocking)

**Warning Message**:
```
[WARNING] Not a git repository

Adoption will work, but:
- No backup via git stash
- No commit history for changes
- Rollback requires manual backup

Consider initializing git: git init
```

### 4. Git Clean

**Command**:
```bash
git -C "<path>" status --porcelain
```

**Verdict**:
- OK: Working tree clean (empty output)
- WARNING: Uncommitted changes (non-blocking)
- BLOCKER: Uncommitted changes without --force

**Warning Message**:
```
[WARNING] Uncommitted changes detected

Modified files:
- file1.ts
- file2.md

Recommendation: Commit or stash changes before adoption.
Use --force to proceed anyway (not recommended).
```

### 5. Version Compatible

**Check**:
1. If target has `simon_tools_meta` in CLAUDE.md, extract version
2. Compare with hub version using [version-compatibility-management](../version-compatibility-management/SKILL.md)

**Command** (conceptual):
```bash
# Extract target version
grep -oP 'version: \K[\d.]+' <path>/CLAUDE.md

# Compare with hub version
# hub_version > target_version → OK (upgrade)
# hub_version == target_version → WARNING (already current)
# hub_version < target_version → BLOCKER (downgrade)
```

**Verdicts**:
- OK: Target is older or new installation
- WARNING: Target is same version (nothing to update)
- BLOCKER: Target is newer than hub (downgrade blocked)

**Error Message**:
```
[BLOCKER] Version incompatible

Target version: 0.47.0
Hub version: 0.46.0

Cannot downgrade framework. Options:
- Update hub first: git pull origin master
- Force downgrade: --force-downgrade (not recommended)
```

### 6. No Active Adoption

**Check**:
1. Read target's `backlog/tasks.json` (if exists)
2. Look for tasks with type "infra" and title containing "Adopt"
3. Check if status is "in_progress"

**Verdict**:
- OK: No active adoption task
- BLOCKER: Active adoption in progress

**Error Message**:
```
[BLOCKER] Active adoption task exists

TASK-042: Adopt simon_tools Framework
Status: in_progress

Complete or cancel the existing task first:
- Complete: /develop-task TASK-042
- Cancel: /update-task TASK-042 cancelled
```

### 7. Backup Location Writable

**Command**:
```bash
# Check or create backup directory
mkdir -p "<path>/.claude-backup" && test -w "<path>/.claude-backup"
```

**Verdict**:
- OK: Backup location ready
- WARNING: Cannot create backup location

**Warning Message**:
```
[WARNING] Cannot create backup directory

Path: <path>/.claude-backup

Adoption will proceed without automatic backup.
Manual backup recommended before continuing.
```

### 8. Serena MCP Available

**Check**:
1. Look for `.mcp.json` in target
2. Verify serena server configuration exists

**Command** (conceptual):
```bash
# Check .mcp.json exists and has serena
jq '.mcpServers.serena' <path>/.mcp.json
```

**Verdict**:
- OK: Serena MCP configured
- WARNING: Serena MCP not found

**Warning Message**:
```
[WARNING] Serena MCP not configured

Semantic code understanding will not be available.
Framework features requiring Serena will be limited.

Serena will be added during installation.
```

## Readiness Score Calculation

The readiness score is calculated as a weighted sum of check results:

```
score = Σ (check_weight × check_result) / Σ (check_weight)

where:
  check_result = 1.0 if OK
  check_result = 0.5 if WARNING
  check_result = 0.0 if BLOCKER
```

**Example Calculation**:
```
Check 1 (Path):       20 × 1.0 = 20
Check 2 (Write):      15 × 1.0 = 15
Check 3 (Git repo):   10 × 1.0 = 10
Check 4 (Git clean):  10 × 0.5 = 5   (warning)
Check 5 (Version):    15 × 1.0 = 15
Check 6 (No active):  10 × 1.0 = 10
Check 7 (Backup):      5 × 1.0 = 5
Check 8 (Serena):     15 × 0.5 = 7.5 (warning)

Total: 87.5 / 100 = 87.5%
```

## Verdicts

| Score | Verdict | Action |
|-------|---------|--------|
| >= 70 | READY | Proceed to task creation |
| >= 70 | READY_WITH_WARNINGS | Proceed with caution notes |
| < 70 | BLOCKED | Show blockers, abort |
| Any blocker | BLOCKED | Cannot proceed |

## Output Format

### READY
```
## Prerequisite Check: READY

**Readiness Score**: 95%

### Checks Passed (8/8)
✓ Path accessible
✓ Write permission
✓ Git repository
✓ Git clean
✓ Version compatible
✓ No active adoption
✓ Backup location ready
✓ Serena MCP available

Ready to create adoption task.
```

### READY_WITH_WARNINGS
```
## Prerequisite Check: READY_WITH_WARNINGS

**Readiness Score**: 85%

### Checks Passed (6/8)
✓ Path accessible
✓ Write permission
✓ Git repository
⚠ Git clean (uncommitted changes)
✓ Version compatible
✓ No active adoption
✓ Backup location ready
⚠ Serena MCP (not configured)

### Warnings
1. Uncommitted changes detected (2 files)
2. Serena MCP will be added during installation

Can proceed with task creation.
```

### BLOCKED
```
## Prerequisite Check: BLOCKED

**Readiness Score**: 35%

### Blockers Found (2)
✗ Path not found: ../invalid-path
✗ No write permission: /readonly/path

### Checks Skipped
- Git repository (path required)
- Git clean (path required)
- Version compatible (path required)
- No active adoption (path required)
- Backup location (path required)
- Serena MCP (path required)

Cannot proceed. Fix blockers first.
```

## Integration with Phase 1

This checklist is executed by `/framework analyze` during [Phase 1](adoption-phases.md#phase-1-analyze):

```
/framework analyze <path>
    │
    ├── Run prerequisite checklist
    │   ├── Check 1: Path accessible
    │   ├── Check 2: Write permission
    │   ├── ...
    │   └── Check 8: Serena MCP
    │
    ├── Calculate readiness score
    │
    ├── Determine verdict
    │   ├── READY → Continue to project detection
    │   ├── READY_WITH_WARNINGS → Continue with notes
    │   └── BLOCKED → Abort with blockers
    │
    └── Include results in analysis output
```

## Cross-References

- Phase workflow: [adoption-phases.md](adoption-phases.md)
- Version compatibility: [version-compatibility-management](../version-compatibility-management/SKILL.md)
- Migration patterns: [framework-migration-planning](../framework-migration-planning/SKILL.md)
