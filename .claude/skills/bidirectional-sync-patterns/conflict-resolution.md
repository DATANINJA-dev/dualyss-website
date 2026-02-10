# Conflict Resolution Strategies

Patterns for detecting and resolving conflicts during bidirectional sync operations. This file provides the decision tree and resolution strategies for sync conflicts.

## Conflict Types

Reference: `git-sync-patterns/conflict-detection.md` for detailed detection algorithm.

### Type 1: Modify/Modify (HIGH Severity)

Both hub and target modified the same file.

```
Hub:    .claude/commands/audit.md    [modified lines 45-50]
Target: .claude/commands/audit.md    [modified lines 48-52]
Result: CONFLICT - overlapping modifications
```

**Risk**: Data loss on either side
**Resolution**: Three-way merge or explicit choice

### Type 2: Add/Add (MEDIUM Severity)

Both sides created a new file with the same path.

```
Hub:    .claude/skills/new-skill/SKILL.md    [created]
Target: .claude/skills/new-skill/SKILL.md    [created]
Result: CONFLICT - parallel additions
```

**Risk**: One version lost
**Resolution**: Compare content, merge if compatible, or rename one

### Type 3: Delete/Modify (HIGH Severity)

Hub deleted a file that target modified.

```
Hub:    .claude/commands/old-cmd.md    [deleted]
Target: .claude/commands/old-cmd.md    [modified]
Result: CONFLICT - delete vs modify
```

**Risk**: Target loses their modifications
**Resolution**: Keep modifications (resurrect) or accept deletion

### Type 4: Modify/Delete (HIGH Severity)

Target deleted a file that hub modified.

```
Hub:    .claude/commands/old-cmd.md    [modified]
Target: .claude/commands/old-cmd.md    [deleted]
Result: CONFLICT - modify vs delete
```

**Risk**: Hub improvements lost
**Resolution**: Accept hub modifications or confirm deletion

### Safe Operations (No Conflict)

These combinations auto-merge without user intervention:

| Hub | Target | Result | Reasoning |
|-----|--------|--------|-----------|
| Modified | Unchanged | Accept hub | Local didn't care about this file |
| Unchanged | Modified | Keep local | Hub didn't change it |
| Added | No file | Accept hub | New file from hub |
| No file | Added | Keep local | Local addition |
| Deleted | Deleted | Accept | Both agree on deletion |

## Resolution Strategies

### Strategy 1: Keep Hub (Discard Local)

**When to use**:
- Hub has authoritative improvements
- Local changes were experimental
- You want to reset to hub state

**Command**: `--resolution=hub` or `[K]` in interactive mode

**Effect**:
```
LOCAL file → discarded
HUB file → kept
Result: File matches hub exactly
```

### Strategy 2: Keep Local (Skip Hub Updates)

**When to use**:
- Local customizations are intentional
- Hub change doesn't apply to your project
- You'll manually incorporate hub ideas later

**Command**: `--resolution=local` or `[L]` in interactive mode

**Effect**:
```
LOCAL file → preserved
HUB file → ignored for this file
Result: File stays as-is locally
```

### Strategy 3: Three-Way Merge (Auto Where Possible)

**When to use**:
- Changes are in different parts of the file
- Both changes are valuable
- Content structure allows merging

**Command**: `--resolution=merge` or `[M]` in interactive mode

**How it works**:
```
BASE (watermark) ←┬→ LOCAL
                  └→ REMOTE (hub)
                       ↓
                    MERGED

Non-overlapping changes → auto-merged
Overlapping changes → manual resolution required
```

Reference: `config-merging-patterns/three-way-merge.md`

### Strategy 4: Manual Resolution

**When to use**:
- Complex overlapping changes
- Need to combine ideas from both sides
- Auto-merge results unsatisfactory

**Process**:
1. View diff of both versions
2. Edit file manually
3. Mark as resolved
4. Continue sync

## Decision Tree

Use this tree to choose resolution strategy:

```
Conflict Detected
    │
    ├─ Is file critical to your project?
    │   │
    │   ├─ YES → Does hub change add value?
    │   │   │
    │   │   ├─ YES → Try THREE-WAY MERGE
    │   │   │        If fails → MANUAL
    │   │   │
    │   │   └─ NO → KEEP LOCAL
    │   │
    │   └─ NO → Is hub version better overall?
    │       │
    │       ├─ YES → KEEP HUB
    │       │
    │       └─ NO → KEEP LOCAL
    │
    └─ Type-specific guidance:
        │
        ├─ modify/modify → TRY THREE-WAY first
        │
        ├─ add/add → Compare content:
        │   ├─ Similar → MANUAL merge best parts
        │   └─ Different → RENAME one, keep both
        │
        ├─ delete/modify → Do you need the file?
        │   ├─ YES → KEEP LOCAL (resurrect)
        │   └─ NO → KEEP HUB (accept deletion)
        │
        └─ modify/delete → Did you delete intentionally?
            ├─ YES → KEEP LOCAL (stay deleted)
            └─ NO → KEEP HUB (restore with mods)
```

## Interactive Resolution UI

When conflicts detected, the sync command presents:

```
## Conflict Resolution Required

Found 3 conflicts blocking sync.

### Conflict 1/3: .claude/commands/audit.md

Type: modify/modify [HIGH]

| Version | Change Summary |
|---------|----------------|
| BASE | Original (v0.29.0) |
| LOCAL | Added verbose output |
| HUB | Improved error handling |

Preview:
  - Lines 45-48: LOCAL adds verbose flag
  - Lines 50-55: HUB adds error codes

Options:
  [K] Keep HUB version
  [L] Keep LOCAL version
  [M] Three-way merge (preview first)
  [V] View full diff
  [S] Skip (decide later)
  [A] Abort sync

Choice: _
```

### Batch Resolution

For multiple conflicts:

```
Found 5 conflicts. How to resolve?

[1] Individual - resolve one by one (default)
[2] All hub - keep hub version for all
[3] All local - keep local version for all
[4] Skip all - defer decisions

Choice: _
```

### Session Memory

Resolution choices can be remembered:

```
Resolution for modify/modify conflicts:
  [R]emember: Always use THREE-WAY merge for this type
  [O]nce: Apply only to this conflict

Remembered choice: THREE-WAY for modify/modify
```

## Conflict Prevention

### Best Practices

1. **Sync frequently** - Smaller deltas = fewer conflicts
2. **Use LOCAL markers** - Protect custom sections from sync
3. **Avoid modifying framework files** - Add custom commands instead
4. **Pull before push** - Resolve conflicts locally first

### LOCAL Markers

Protect custom content from sync:

```markdown
## Framework Content (synced)

<!-- LOCAL_START -->
## My Custom Notes

This section is NEVER overwritten by sync.
<!-- LOCAL_END -->
```

Reference: `config-merging-patterns/section-parsing.md`

## Examples

### Example 1: Modify/Modify with Auto-Merge Success

```
Conflict: .claude/commands/audit.md
Type: modify/modify

LOCAL changes: Lines 10-15 (added new flag)
HUB changes: Lines 80-90 (improved help text)

Analysis: Changes don't overlap ✓

Attempting three-way merge...
✓ Auto-merge successful

Result:
  - LOCAL flag changes preserved
  - HUB help text incorporated
  - No manual intervention needed
```

### Example 2: Modify/Modify Requiring Manual

```
Conflict: .claude/skills/tdd-workflow/SKILL.md
Type: modify/modify

LOCAL changes: Lines 45-60 (modified workflow)
HUB changes: Lines 50-65 (also modified workflow)

Analysis: Overlapping changes ✗

Three-way merge result:
<<<<<<< LOCAL
  Step 1: Write failing test
  Step 2: Run test (expect red)
=======
  Step 1: Design test first
  Step 2: Implement test
>>>>>>> HUB

Manual resolution required.
```

### Example 3: Delete/Modify Resolution

```
Conflict: .claude/commands/old-feature.md
Type: delete/modify

HUB: Deleted (deprecated feature)
LOCAL: Modified (added custom usage)

Decision tree:
  Q: Do you need this file?
  A: Yes, I added custom integration

Resolution: KEEP LOCAL

Result: File preserved in target project
Note: File won't exist in hub going forward
```

### Example 4: Add/Add with Rename

```
Conflict: .claude/skills/validation/SKILL.md
Type: add/add

LOCAL version: SEO validation patterns
HUB version: Form validation patterns

Both valuable but different purpose.

Resolution: Rename local
  .claude/skills/seo-validation/SKILL.md (LOCAL)
  .claude/skills/validation/SKILL.md (HUB)

Both skills now coexist.
```

### Example 5: Version Divergence Conflict

```
Conflict: CLAUDE.md version field
Type: modify/modify (special)

LOCAL: version: 0.30.0-custom
HUB: version: 0.31.0

This is a version divergence conflict.
Resolution: Accept HUB version for compatibility.

After resolution:
  version: 0.31.0
  (Custom changes preserved in LOCAL sections)
```

## Resolution Checklist

### Before Resolving
- [ ] Understand what each side changed
- [ ] Identify the purpose of each change
- [ ] Determine which changes are essential

### During Resolution
- [ ] Use preview before applying
- [ ] Verify merge result looks correct
- [ ] Test functionality after merge

### After Resolution
- [ ] All conflicts resolved or skipped
- [ ] Sync can proceed
- [ ] Note skipped items for later

## Error Codes

| Code | Situation | Resolution |
|------|-----------|------------|
| E412 | No base version | Use --force-local or --force-hub |
| E413 | Corrupt base | Reset watermark with /sync-watermark --reset |
| E415 | Circular reference | Manual resolution required |
| E423 | Unresolved conflicts | Complete resolution or abort |

## Related Files

| File | Purpose |
|------|---------|
| `merge-strategies.md` | File-type specific merging |
| `git-sync-patterns/conflict-detection.md` | Detection algorithm |
| `config-merging-patterns/three-way-merge.md` | Merge algorithm |
| `config-merging-patterns/conflict-resolution-ui.md` | UI patterns |
