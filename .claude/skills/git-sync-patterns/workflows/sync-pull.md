# Sync Pull Workflow

Pull updates from hub repository to local project using git subtree.

## Prerequisites

- Git 1.7.11+ (subtree support)
- Project initialized with `.claude/` subtree
- Hub remote configured

## Workflow Phases

### Phase 0: Version Compatibility Check

**CRITICAL**: Always check version compatibility before pulling updates.

1. **Extract local version**:
   - Read `CLAUDE.md`
   - Parse `<!-- simon_tools_meta version: X.Y.Z -->`

2. **Fetch hub version**:
   - Get hub CLAUDE.md (via git fetch or API)
   - Parse version from metadata

3. **Load compatibility matrix**:
   - Read `.claude/compatibility.yaml`
   - Find hub version entry

4. **Evaluate constraint**:
   - Get `compatible_with` from hub entry
   - Compare local version against constraint
   - Handle caret/tilde ranges correctly

5. **If incompatible**:
   ```
   [ERROR] E301: Version incompatible

   Local: [X.Y.Z]
   Hub: [A.B.C]
   Constraint: [constraint] (NOT satisfied)

   Run `/sync-check-version` for details and upgrade path.
   ```
   - **BLOCK** sync operation
   - Exit with error code 1

6. **If compatible**: Proceed to Phase 1

### Phase 1: Pre-Pull Checks

1. **Check working tree status**:
   ```bash
   git status --porcelain
   ```
   - If uncommitted changes in `.claude/`: Warn or block

2. **Verify subtree exists**:
   ```bash
   git log --oneline --all -- .claude/ | head -1
   ```
   - If no history: Error - run install first

3. **Check current branch**:
   - Should be on main/master or feature branch
   - Not in detached HEAD state

### Phase 2: Fetch Hub Updates

1. **Fetch remote**:
   ```bash
   git fetch <hub-remote> main
   ```

2. **Calculate delta** (optional):
   - Compare local watermark to hub HEAD
   - Use delta-detection.md patterns

3. **Show preview**:
   ```
   ## Updates Available

   Hub version: [A.B.C]
   Commits since last sync: [N]

   Files changed:
   - [list of changed files]

   Proceed with pull? [Y/n]
   ```

### Phase 3: Execute Pull

1. **Run subtree pull**:
   ```bash
   git subtree pull --prefix=.claude <hub-remote> main --squash -m "Sync: Update .claude/ to [version]"
   ```

2. **Handle conflicts** (if any):
   - Use conflict-detection.md patterns
   - Report conflicts to user
   - Block until resolved

### Phase 4: Post-Pull Verification

1. **Update watermark**:
   - Update `sync_watermark` in CLAUDE.md
   - Update `last_sync` timestamp

2. **Verify integrity**:
   - Check key files exist
   - Run quick validation

3. **Report success**:
   ```
   ## Sync Complete

   Updated: [old version] → [new version]
   Files changed: [N]
   Commit: [hash]

   Next: Review changes with `git diff HEAD~1`
   ```

## Error Handling

| Error | Recovery |
|-------|----------|
| Version incompatible | Run `/sync-check-version`, upgrade local |
| Uncommitted changes | Commit or stash first |
| Merge conflicts | Resolve manually, then `git add` |
| Network error | Check connectivity, retry |

## Related Patterns

- `subtree-operations.md` - Core subtree commands
- `watermark-tracking.md` - Watermark format
- `conflict-detection.md` - Conflict resolution
- `version-compatibility-management` skill - Version checks
