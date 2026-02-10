# Conflict Detection

Patterns for identifying and reporting sync conflicts between hub and target projects.

## Overview

Conflict detection identifies files modified on both hub and target since the last sync watermark. This prevents data loss by blocking sync operations that would overwrite changes.

**Key Principle**: Detect, report, block. Never auto-resolve destructive conflicts.

## Conflict Types

### 1. Modify/Modify Conflict

Both hub and target modified the same file since watermark.

```
Hub:    .claude/commands/audit.md    [modified line 45-50]
Target: .claude/commands/audit.md    [modified line 48-52]
Result: CONFLICT - overlapping modifications
```

### 2. Add/Add Conflict (Parallel Addition)

Both hub and target added a new file with the same path.

```
Hub:    .claude/skills/new-skill/SKILL.md    [created]
Target: .claude/skills/new-skill/SKILL.md    [created]
Result: CONFLICT - parallel additions (content may differ)
```

### 3. Delete/Modify Conflict

One side deleted a file, the other modified it.

```
Hub:    .claude/commands/old-cmd.md    [deleted]
Target: .claude/commands/old-cmd.md    [modified]
Result: CONFLICT - delete vs modify
```

### 4. Modify/Delete Conflict

Inverse of above.

```
Hub:    .claude/commands/old-cmd.md    [modified]
Target: .claude/commands/old-cmd.md    [deleted]
Result: CONFLICT - modify vs delete
```

## Delta Detection Algorithm

### Step 1: Compute Hub Delta

Get files changed on hub since watermark:

```bash
# Get hub changes since watermark commit
git fetch simon_tools
git diff --name-status ${WATERMARK_COMMIT}..simon_tools/main -- .claude/

# Output format:
# M  .claude/commands/audit.md        (modified)
# A  .claude/skills/new-skill/SKILL.md (added)
# D  .claude/commands/old.md          (deleted)
```

### Step 2: Compute Local Delta

Get files changed locally since watermark:

```bash
# Get local changes since watermark
git diff --name-status ${WATERMARK_COMMIT}..HEAD -- .claude/

# Same output format
```

### Step 3: Find Intersections

```javascript
function detectConflicts(hubDelta, localDelta) {
  const conflicts = [];

  for (const [file, hubChange] of Object.entries(hubDelta)) {
    const localChange = localDelta[file];

    if (!localChange) continue; // No conflict

    // Both sides touched the same file
    const conflictType = classifyConflict(hubChange, localChange);

    if (conflictType !== 'safe') {
      conflicts.push({
        file,
        hubChange,
        localChange,
        type: conflictType
      });
    }
  }

  return conflicts;
}

function classifyConflict(hubChange, localChange) {
  // M = modified, A = added, D = deleted

  if (hubChange === 'M' && localChange === 'M') {
    return 'modify_modify';
  }
  if (hubChange === 'A' && localChange === 'A') {
    return 'add_add';
  }
  if (hubChange === 'D' && localChange === 'M') {
    return 'delete_modify';
  }
  if (hubChange === 'M' && localChange === 'D') {
    return 'modify_delete';
  }
  if (hubChange === 'D' && localChange === 'D') {
    return 'safe'; // Both deleted, no conflict
  }

  return 'unknown';
}
```

## Conflict Report Format

### Standard Report

```markdown
## Sync Conflict Report

**Hub**: simon_tools main (abc123)
**Local**: HEAD (def456)
**Watermark**: xyz789 (2026-01-08)

### Conflicts Detected: 3

| File | Hub Change | Local Change | Type |
|------|------------|--------------|------|
| `.claude/commands/audit.md` | Modified | Modified | modify/modify |
| `.claude/skills/new-skill/SKILL.md` | Added | Added | add/add |
| `.claude/commands/old.md` | Deleted | Modified | delete/modify |

### Blocking Sync

Sync cannot proceed until conflicts are resolved.

**Options:**
1. Keep hub version: Discard local changes
2. Keep local version: Skip hub updates for these files
3. Manual merge: Resolve conflicts manually
```

### JSON Format (For Programmatic Use)

```json
{
  "status": "conflicts_detected",
  "hub_ref": "abc123",
  "local_ref": "def456",
  "watermark_ref": "xyz789",
  "watermark_date": "2026-01-08T12:00:00Z",
  "conflict_count": 3,
  "conflicts": [
    {
      "file": ".claude/commands/audit.md",
      "hub_change": "modified",
      "local_change": "modified",
      "type": "modify_modify",
      "severity": "high"
    },
    {
      "file": ".claude/skills/new-skill/SKILL.md",
      "hub_change": "added",
      "local_change": "added",
      "type": "add_add",
      "severity": "medium"
    },
    {
      "file": ".claude/commands/old.md",
      "hub_change": "deleted",
      "local_change": "modified",
      "type": "delete_modify",
      "severity": "high"
    }
  ],
  "recommendation": "manual_resolution_required"
}
```

## Severity Classification

| Conflict Type | Severity | Reasoning |
|---------------|----------|-----------|
| modify/modify | High | Risk of losing changes on both sides |
| delete/modify | High | Risk of losing modifications |
| modify/delete | High | Risk of losing modifications |
| add/add | Medium | May be intentional divergence |

## Pre-Sync Check Pattern

### Full Check Flow

```javascript
async function preSyncCheck(hubRemote, watermark) {
  // Step 1: Validate watermark
  const watermarkValid = validateWatermark(watermark);
  if (!watermarkValid.valid) {
    return {
      proceed: false,
      reason: 'invalid_watermark',
      details: watermarkValid.errors
    };
  }

  // Step 2: Compute deltas
  const hubDelta = await computeHubDelta(hubRemote, watermark.sync_watermark);
  const localDelta = await computeLocalDelta(watermark.sync_watermark);

  // Step 3: Detect conflicts
  const conflicts = detectConflicts(hubDelta, localDelta);

  // Step 4: Return decision
  if (conflicts.length > 0) {
    return {
      proceed: false,
      reason: 'conflicts_detected',
      conflicts,
      report: generateConflictReport(conflicts)
    };
  }

  return {
    proceed: true,
    hubChanges: Object.keys(hubDelta).length,
    localChanges: Object.keys(localDelta).length
  };
}
```

### Blocking Behavior

When conflicts are detected:

1. **Block the sync** - Do not proceed with `git subtree pull`
2. **Display report** - Show conflict details to user
3. **Require explicit action** - User must resolve or override
4. **Log the block** - Record for audit trail

```javascript
function handleConflicts(conflicts, userChoice) {
  switch (userChoice) {
    case 'abort':
      return { action: 'abort', message: 'Sync aborted by user' };

    case 'keep_hub':
      // User accepts hub version, discards local changes
      return {
        action: 'proceed_with_override',
        override: 'hub',
        affected: conflicts.map(c => c.file)
      };

    case 'keep_local':
      // User keeps local, marks these files as excluded from sync
      return {
        action: 'proceed_with_exclusion',
        excluded: conflicts.map(c => c.file)
      };

    case 'manual':
      // User will resolve manually
      return {
        action: 'pause_for_resolution',
        instructions: generateMergeInstructions(conflicts)
      };
  }
}
```

## Edge Cases

| Situation | Handling |
|-----------|----------|
| Watermark commit doesn't exist | Full diff required (warn user) |
| No changes on hub | No conflicts possible, proceed |
| No changes locally | No conflicts possible, proceed |
| Binary files modified | Flag for manual review |
| File renamed (not detected) | Appears as delete + add |
| Permission changes only | Treat as modification |

## Integration with Sync Commands

### Pre-Pull Hook

```bash
# Before running subtree pull, check for conflicts
conflicts=$(check_conflicts "$WATERMARK")

if [ -n "$conflicts" ]; then
  echo "Conflicts detected. Sync blocked."
  echo "$conflicts"
  exit 1
fi

# No conflicts, proceed
git subtree pull --prefix=.claude simon_tools main --squash
```

---

## Source

Conflict detection patterns informed by:
- Git's built-in merge conflict detection
- [Git Subtree Basics Gist](https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202) (divergent history handling)
- [Mastering Git Subtrees](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec) (sync workflow patterns)
