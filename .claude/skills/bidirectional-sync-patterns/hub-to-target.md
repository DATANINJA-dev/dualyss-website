# Hub-to-Target Sync Pattern (Pull Operations)

Pull updates from the hub repository to a target project. This pattern implements the complete workflow for `/framework update` and `/sync-pull` commands.

## When to Pull

- Hub has new features or fixes you want
- Periodic sync to stay current with framework
- After hub releases a new version
- When your target project needs specific improvements

## Pre-Pull Checklist

Before initiating a pull operation:

```
[ ] Clean working tree (no uncommitted changes)
[ ] Valid watermark in CLAUDE.md meta section
[ ] Hub remote configured (`git remote -v | grep simon_tools`)
[ ] Version compatibility verified
[ ] Backup created (if destructive merge expected)
```

## Pull Workflow Phases

### Phase 0: Version Compatibility Check

**Command**: `/sync-check-version`

```
Input: Current hub version, target version
Output: COMPATIBLE | BREAKING_CHANGE | UNKNOWN

If BREAKING_CHANGE:
  Display migration notes
  Require --force to proceed
  Error: E422 (Version incompatibility)
```

Reference: `version-compatibility-management` skill

### Phase 1: Fetch Hub State

Retrieve current hub state without modifying local files:

```bash
# Fetch latest from hub
git fetch simon_tools

# Get hub HEAD
hub_head=$(git rev-parse simon_tools/main)

# Get local watermark
watermark=$(grep 'sync_watermark' CLAUDE.md | cut -d: -f2 | tr -d ' ')

# Validate watermark exists
if [ -z "$watermark" ]; then
  echo "[ERROR] E103: Watermark corrupted"
  exit 1
fi
```

### Phase 2: Delta Detection

Calculate what changed on both sides since watermark:

```
Hub Delta = Files changed on hub since watermark
Local Delta = Files changed locally since watermark

For each file in Hub Delta:
  If file in Local Delta:
    Mark as potential conflict
  Else:
    Mark as safe to pull
```

Reference: `git-sync-patterns/delta-detection.md`

### Phase 3: Conflict Detection

**Critical**: Block sync if conflicts exist.

```
Conflicts = Hub Delta ∩ Local Delta (same files modified both sides)

For each conflict:
  Classify type:
    - modify/modify → HIGH severity
    - add/add → MEDIUM severity
    - delete/modify → HIGH severity
```

Reference: `git-sync-patterns/conflict-detection.md`

### Phase 3.5: Three-Way Merge Preview

**If conflicts detected**:

```
For each conflicting file:
  BASE = File at watermark commit
  LOCAL = File in working tree
  REMOTE = File on hub

  Preview merge result:
    - Auto-mergeable changes (non-overlapping)
    - Conflicts requiring resolution
```

Reference: `config-merging-patterns/three-way-merge.md`

### Phase 4: Apply Changes

**If no conflicts OR conflicts resolved**:

```bash
# Pull with squash (clean history)
git subtree pull --prefix=.claude simon_tools main --squash

# Or without squash (full history)
git subtree pull --prefix=.claude simon_tools main
```

**Squash recommendation**: Use `--squash` for target projects to keep history clean.

### Phase 5: Update Watermark

After successful pull:

```yaml
# Update CLAUDE.md meta section
<!-- simon_tools_meta
version: [new version]
sync_watermark: [new hub HEAD]
hub_commit: [hub commit hash]
local_commit: [new local commit hash]
last_sync: [ISO timestamp]
-->
```

## Conflict Handling

When Phase 3 detects conflicts:

```
## Sync Blocked: Conflicts Detected

| File | Hub Change | Local Change | Severity |
|------|------------|--------------|----------|
| .claude/commands/audit.md | Modified | Modified | HIGH |

### Resolution Options

[K] Keep hub version - Discard local changes
[L] Keep local version - Skip hub updates for these files
[M] Manual merge - Open conflict resolution UI
[A] Abort - Cancel sync entirely

Choice: _
```

Reference: `conflict-resolution.md` for detailed strategies

## Rollback Procedure

If something goes wrong after pull:

```bash
# List available backups
/sync-rollback --list

# Restore from backup
/sync-rollback [timestamp]
```

Backups created at: `.backup/pre-pull-[timestamp]/`

Reference: `/sync-rollback` command documentation

## Examples

### Example 1: Clean Pull (No Conflicts)

```
$ /sync-pull

Phase 0: Version check... 0.30.0 → 0.31.0 [COMPATIBLE]
Phase 1: Fetching hub state...
Phase 2: Computing deltas...
  Hub: 5 files changed
  Local: 0 files changed
Phase 3: Conflict detection... [NONE]
Phase 4: Applying changes...

Squash commit: [hash]

  .claude/commands/audit.md | +15 -3
  .claude/skills/new-skill/ | new directory
  [3 more files]

Phase 5: Watermark updated.

Pull complete. 5 files updated.
```

### Example 2: Pull with Conflicts

```
$ /sync-pull

Phase 0: Version check... 0.30.0 → 0.31.0 [COMPATIBLE]
Phase 1: Fetching hub state...
Phase 2: Computing deltas...
  Hub: 3 files changed
  Local: 2 files changed
Phase 3: Conflict detection... [2 CONFLICTS]

## Sync Blocked

| File | Type | Severity |
|------|------|----------|
| .claude/commands/commit.md | modify/modify | HIGH |
| .claude/skills/tdd-workflow/SKILL.md | modify/modify | HIGH |

Resolve conflicts to proceed:
  /sync-merge-preview .claude/commands/commit.md
  /sync-merge-preview .claude/skills/tdd-workflow/SKILL.md

Or use: [K]eep hub / [L]ocal / [M]anual / [A]bort
```

### Example 3: Version Mismatch

```
$ /sync-pull

Phase 0: Version check... 0.28.0 → 0.31.0

[WARNING] Breaking changes detected

Migration required:
  - /set-up renamed to /refine
  - E4XX error codes reorganized

Options:
  [M] View migration guide
  [F] Force pull (--force)
  [A] Abort

Recommended: Run migration steps first, then pull.
```

## Quick Reference Checklist

### Before Pull
- [ ] `git status` shows clean tree
- [ ] Watermark exists in CLAUDE.md
- [ ] Hub remote configured
- [ ] Run `/sync-check-version` first

### During Pull
- [ ] Review conflict report if any
- [ ] Choose resolution strategy per file
- [ ] Verify merge preview looks correct

### After Pull
- [ ] Verify watermark updated
- [ ] Test affected functionality
- [ ] Commit any manual resolutions

## Error Codes

| Code | Situation | Resolution |
|------|-----------|------------|
| E103 | Watermark corrupted | Reset with `/sync-watermark --reset` |
| E109 | Invalid watermark format | Check CLAUDE.md meta section |
| E422 | Version incompatibility | Update or use --force |
| E423 | Sync conflict detected | Resolve with `/sync-merge-preview` |
| E430 | Git subtree failed | Check git state, retry |

## Related Commands

| Command | Purpose |
|---------|---------|
| `/sync-check-version` | Phase 0 version compatibility |
| `/sync-status` | View delta without pulling |
| `/sync-merge-preview` | Preview three-way merge |
| `/sync-rollback` | Restore from backup |
| `/sync-watermark` | View/update watermark |
