# Three-Way Merge Algorithm

Three-way merge algorithm for resolving configuration conflicts during sync. Compares common ancestor (BASE), local changes, and remote changes to automatically merge non-overlapping modifications.

> **Implementation**: See `merge-algorithm.md` for the complete executable algorithm with data types, error handling, and performance considerations.
>
> **Command**: Use `/sync-merge-preview <file>` to preview merge results before applying.
>
> **Integration**: `/sync-pull` Phase 3.5 uses this algorithm for enhanced conflict resolution.

## Algorithm Concept

### Three-Way Merge Topology

```
        BASE (common ancestor, from watermark)
        /  \
       /    \
      v      v
    LOCAL   REMOTE
   (target) (hub)

        \  /
         \/
       MERGED
   (resolved result)
```

**Key Insight**: By comparing both LOCAL and REMOTE against BASE, we can determine:
- What changed locally (LOCAL - BASE)
- What changed remotely (REMOTE - BASE)
- Where changes overlap (conflicts)

## Change Categories

### Decision Matrix

| Category | Base | Local | Remote | Result | Rationale |
|----------|------|-------|--------|--------|-----------|
| No change | A | A | A | A | No merge needed |
| Only local changed | A | B | A | B | Accept local change |
| Only remote changed | A | A | B | B | Accept remote change |
| Both changed identically | A | B | B | B | Auto-merge (same change) |
| Both changed differently | A | B | C | **CONFLICT** | Manual resolution required |
| Local added, remote unchanged | - | B | - | B | Accept local addition |
| Remote added, local unchanged | - | - | B | B | Accept remote addition |
| Both added same key | - | B | C | **CONFLICT** | Manual resolution required |
| Local deleted, remote unchanged | A | - | A | - | Accept local deletion |
| Remote deleted, local unchanged | A | A | - | - | Accept remote deletion |
| Local modified, remote deleted | A | B | - | **CONFLICT** | Manual resolution required |
| Local deleted, remote modified | A | - | B | **CONFLICT** | Manual resolution required |

### Change Type Definitions

```
Change Types:
  UNCHANGED  - Value identical to base
  ADDED      - Key not in base, present in version
  MODIFIED   - Key in base, different value in version
  DELETED    - Key in base, absent in version
```

## Diff Calculation

### diffFromBase Function

Calculate what changed between base and a given version:

```
function diffFromBase(base, current):
  changes = []

  // Find deleted keys (in base but not in current)
  for key in base:
    if key not in current:
      changes.push({
        type: "DELETED",
        key: key,
        baseValue: base[key],
        newValue: null
      })

  // Find added and modified keys
  for key in current:
    if key not in base:
      changes.push({
        type: "ADDED",
        key: key,
        baseValue: null,
        newValue: current[key]
      })
    else if not deepEqual(base[key], current[key]):
      changes.push({
        type: "MODIFIED",
        key: key,
        baseValue: base[key],
        newValue: current[key]
      })

  return changes
```

### Example Diff Output

```
Base:   { "version": "0.29.0", "port": 3000, "debug": false }
Local:  { "version": "0.30.0", "port": 3000, "ssl": true }

diffFromBase(base, local) = [
  { type: "MODIFIED", key: "version", baseValue: "0.29.0", newValue: "0.30.0" },
  { type: "DELETED", key: "debug", baseValue: false, newValue: null },
  { type: "ADDED", key: "ssl", baseValue: null, newValue: true }
]
```

## Three-Way Merge Logic

### Main Algorithm

```
function threeWayMerge(base, local, remote):
  // Calculate deltas
  localChanges = diffFromBase(base, local)
  remoteChanges = diffFromBase(base, remote)

  // Build lookup maps for quick conflict detection
  localChangeMap = buildChangeMap(localChanges)
  remoteChangeMap = buildChangeMap(remoteChanges)

  // Initialize result and tracking
  result = deepCopy(base)
  conflicts = []
  autoMerged = []

  // Process local changes
  for change in localChanges:
    remoteChange = remoteChangeMap.get(change.key)

    if remoteChange is null:
      // Only local changed - apply it
      applyChange(result, change)
      autoMerged.push({
        key: change.key,
        source: "local",
        type: change.type
      })

    else if changesAreIdentical(change, remoteChange):
      // Both made same change - apply once
      applyChange(result, change)
      autoMerged.push({
        key: change.key,
        source: "both_identical",
        type: change.type
      })

    else:
      // Conflict: different changes to same key
      conflicts.push({
        key: change.key,
        base: base[change.key],
        local: change.newValue,
        remote: remoteChange.newValue,
        localType: change.type,
        remoteType: remoteChange.type
      })

  // Process remote-only changes
  for change in remoteChanges:
    if localChangeMap.get(change.key) is null:
      // Only remote changed - apply it
      applyChange(result, change)
      autoMerged.push({
        key: change.key,
        source: "remote",
        type: change.type
      })

  return {
    merged: result,
    conflicts: conflicts,
    autoMerged: autoMerged,
    hasConflicts: conflicts.length > 0
  }
```

### Apply Change Helper

```
function applyChange(target, change):
  switch change.type:
    case "ADDED":
    case "MODIFIED":
      target[change.key] = change.newValue
      break
    case "DELETED":
      delete target[change.key]
      break
```

## Conflict Resolution Strategies

### Resolution Options

| Strategy | Command/Action | Result | When to Use |
|----------|----------------|--------|-------------|
| Keep Local | `--resolution=local` | Use local version | Local customization is critical |
| Keep Remote | `--resolution=remote` | Use remote (hub) version | Hub is source of truth |
| Keep Both | `--resolution=both` | Merge keys from both | Non-overlapping nested objects |
| Manual | Open in editor | User edits file | Complex conflicts |
| Abort | `--abort` | Cancel merge | Need more information |

### Conflict Marker Format

For files that support it, insert git-style conflict markers:

```
<<<<<<< LOCAL
  "version": "0.30.0-custom"
=======
  "version": "0.30.0"
>>>>>>> REMOTE
```

For JSON (which doesn't support inline markers), use a companion `.conflicts` file:

```json
{
  "file": "config.json",
  "conflicts": [
    {
      "path": "$.version",
      "base": "0.29.0",
      "local": "0.30.0-custom",
      "remote": "0.30.0",
      "resolution": null
    }
  ]
}
```

### Conflict Report Structure

```
Conflict Report

File: .claude/commands/commit.md
Conflict Type: MODIFY/MODIFY
Both sides changed this file.

┌─ BASE (v0.29.0) ─────────────────────────────────────
│ Original content from common ancestor...
├─ LOCAL (your changes) ───────────────────────────────
│ Your modified content...
├─ REMOTE (hub) ───────────────────────────────────────
│ Hub's modified content...
└──────────────────────────────────────────────────────

Resolution Options:
  [L] Keep LOCAL version
  [R] Keep REMOTE version
  [M] Manual merge (opens editor)
  [S] Skip (decide later)
  [A] Abort sync

Choice:
```

## Edge Cases

### Missing Base

**Scenario**: No common ancestor available (first sync or corrupted watermark).

**Handling**:
```
if base is null or base is empty:
  // Cannot perform three-way merge
  // Fall back to two-way comparison
  return {
    error: E412("Cannot three-way merge: no base version"),
    suggestion: "Use --force-remote or --force-local to choose one side"
  }
```

### Corrupt Base

**Scenario**: Base file exists but cannot be parsed.

**Handling**:
```
try:
  base = parseJson(baseContent)
catch ParseError:
  return {
    error: E413("Base version corrupted"),
    suggestion: "Reset watermark with /sync-watermark --reset"
  }
```

### Type Conflicts

**Scenario**: Same key has different types in local vs remote.

```
Base:   { "config": { "port": 3000 } }          // object
Local:  { "config": { "port": 8080 } }          // object (modified)
Remote: { "config": "production" }              // string (type change!)
```

**Handling**:
```
if typeOf(localValue) != typeOf(remoteValue):
  conflicts.push({
    key: key,
    type: "TYPE_MISMATCH",
    localType: typeOf(localValue),
    remoteType: typeOf(remoteValue),
    resolution: "manual_required"
  })
```

### Array Handling

**Arrays are NOT merged element-by-element** (following RFC 7396):

```
Base:   { "items": [1, 2, 3] }
Local:  { "items": [1, 2, 3, 4] }     // Added 4
Remote: { "items": [1, 2, 3, 5] }     // Added 5

// This is a CONFLICT, not [1,2,3,4,5]
// Arrays are replaced wholesale, not merged
```

### Circular References

**Detection**: Check for circular references before merge.

```
function hasCircularRef(obj, seen = new Set()):
  if not isObject(obj):
    return false

  if seen.has(obj):
    return true

  seen.add(obj)

  for value in Object.values(obj):
    if hasCircularRef(value, seen):
      return true

  seen.delete(obj)
  return false
```

### Deeply Nested Objects

**Recursive merge for nested structures**:

```
Base:   { "a": { "b": { "c": 1, "d": 2 } } }
Local:  { "a": { "b": { "c": 3 } } }           // Changed c
Remote: { "a": { "b": { "d": 4 } } }           // Changed d

Result: { "a": { "b": { "c": 3, "d": 4 } } }   // Both changes applied
```

## Real-World Examples

### Example 1: Version Update (No Conflict)

**Scenario**: Hub updates version, local made unrelated changes.

```yaml
Base:
  version: "0.29.0"
  customField: "old"

Local:
  version: "0.29.0"
  customField: "new"    # Local changed this

Remote:
  version: "0.30.0"     # Hub updated version
  customField: "old"
```

**Result**:
```yaml
Merged:
  version: "0.30.0"     # From remote
  customField: "new"    # From local
```

**Auto-merged**:
- `version`: remote (MODIFIED)
- `customField`: local (MODIFIED)

### Example 2: Overlapping Edit (Conflict)

**Scenario**: Both sides modified the same field.

```yaml
Base:
  timeout: 5000

Local:
  timeout: 10000        # User increased timeout

Remote:
  timeout: 3000         # Hub optimized timeout
```

**Result**:
```
CONFLICT on key: timeout
  Base:   5000
  Local:  10000
  Remote: 3000

Resolution required.
```

### Example 3: Independent Additions (Auto-Merge)

**Scenario**: Local adds SSL, hub adds logging. No overlap.

```yaml
Base:
  port: 3000

Local:
  port: 3000
  ssl: true             # User added SSL

Remote:
  port: 3000
  logging: "debug"      # Hub added logging
```

**Result**:
```yaml
Merged:
  port: 3000
  ssl: true             # From local
  logging: "debug"      # From remote
```

### Example 4: Delete vs Modify (Conflict)

**Scenario**: Local deleted a field that hub modified.

```yaml
Base:
  feature: { enabled: false }

Local:
  # feature deleted entirely

Remote:
  feature: { enabled: true }  # Hub enabled the feature
```

**Result**:
```
CONFLICT on key: feature
  Type: DELETE/MODIFY
  Local:  (deleted)
  Remote: { enabled: true }

Resolution required:
  - Keep deletion (local)
  - Keep modification (remote)
```

### Example 5: Same Change Made Both Sides (No Conflict)

**Scenario**: Both local and remote made identical change.

```yaml
Base:
  version: "0.29.0"

Local:
  version: "0.30.0"     # Updated to 0.30.0

Remote:
  version: "0.30.0"     # Also updated to 0.30.0
```

**Result**:
```yaml
Merged:
  version: "0.30.0"     # Identical change, no conflict
```

## Merge Command Pattern

Implemented in `/sync-merge-preview` (TASK-090):

```
/sync-merge-preview <file> [--json] [--apply]

Options:
  <file>    Path to file under .claude/ to preview merge
  --json    Output in JSON format (programmatic use)
  --apply   Apply merge result after preview (interactive)
```

**Features:**
- Automatic BASE version retrieval from watermark commit
- LOCAL version from working tree
- REMOTE version from hub (simon_tools/main)
- Auto-merge detection for non-conflicting changes
- Per-conflict resolution: local/remote/base/custom
- Error handling: E412 (no base), E413 (corrupt), E415 (circular ref)

## Conflict Resolution UI Integration

> **Full UI Patterns**: See `conflict-resolution-ui.md` for complete interaction patterns.
>
> **Implemented by**: TASK-094

The conflict resolution UI provides interactive resolution for conflicts detected by the three-way merge algorithm. Key features:

### Quick Reference

| Key | Action | Use When |
|-----|--------|----------|
| [L] | Keep local | Your change is intentional |
| [R] | Keep remote | Hub update takes priority |
| [B] | Keep base | Discard both changes |
| [M] | Manual | Need custom value |
| [S] | Skip | Decide later |
| [A] | Abort | Cancel sync entirely |

### Single Conflict Example

```
## Conflict 1/3: config.timeout

**Type**: modify_modify [HIGH]

| Version | Value |
|---------|-------|
| BASE | 5000 |
| LOCAL | 10000 (your change) |
| REMOTE | 3000 (hub change) |

Choice: _
```

### Batch Resolution

For multiple conflicts, batch options are offered first:

```
Found 5 conflicts. How to resolve?

[1] Individual - one by one (default)
[2] All local - keep your versions
[3] All remote - keep hub versions
[4] Skip all - defer decisions
```

### Session Memory

Resolution choices can be remembered for similar conflict types within a session, reducing repetitive decisions.

### Resolution Summary

After all conflicts resolved:

```
## Resolution Summary

| Path | Type | Choice | Value |
|------|------|--------|-------|
| `timeout` | modify_modify | local | 10000 |
| `port` | modify_modify | remote | 9000 |

Total: 5 conflicts, 4 resolved, 1 skipped
```
