# Sync Push Workflow

Push local improvements back to hub repository using git subtree.

## Prerequisites

- Git 1.7.11+ (subtree support)
- Project initialized with `.claude/` subtree
- Hub remote configured
- Write access to hub (fork or direct)

## Workflow Phases

### Phase 0: Version Compatibility Check

**CRITICAL**: Verify version compatibility before pushing contributions.

1. **Extract local version**:
   - Read `CLAUDE.md`
   - Parse `<!-- simon_tools_meta version: X.Y.Z -->`

2. **Fetch current hub version**:
   - Get hub CLAUDE.md
   - Ensure local is up-to-date with hub

3. **Load compatibility matrix**:
   - Read `.claude/compatibility.yaml`
   - Verify local version exists in matrix

4. **Check for version conflicts**:
   - If local version > hub version: May be ahead (check)
   - If local version < hub version: Must pull first

5. **If version mismatch or incompatible**:
   ```
   [ERROR] E301: Version mismatch

   Local: [X.Y.Z]
   Hub: [A.B.C]

   Action required:
   - If hub is newer: Pull updates first with `/sync-pull`
   - If local is newer: Verify changes are intentional

   Run `/sync-check-version` for details.
   ```
   - **BLOCK** push operation
   - Exit with error code 1

6. **If compatible**: Proceed to Phase 1

### Phase 1: Pre-Push Validation

1. **Check working tree clean**:
   ```bash
   git status --porcelain
   ```
   - Must have no uncommitted changes in `.claude/`

2. **Verify changes exist**:
   ```bash
   git diff HEAD~[N] --stat -- .claude/
   ```
   - If no changes: Nothing to push

3. **Review changes**:
   ```
   ## Changes to Push

   | File | Status | Lines |
   |------|--------|-------|
   | [file] | [M/A/D] | +N/-N |

   Proceed? [Y/n/review]
   ```

### Phase 2: Split Subtree

1. **Create split branch**:
   ```bash
   git subtree split --prefix=.claude -b contrib-branch
   ```

2. **Verify split**:
   - Branch should contain only `.claude/` contents
   - History should be clean

### Phase 3: Push to Hub

**Option A: Direct push** (if maintainer):
```bash
git push <hub-remote> contrib-branch:feature/[description]
```

**Option B: Fork workflow** (if contributor):
1. Push to fork:
   ```bash
   git push <fork-remote> contrib-branch:feature/[description]
   ```
2. Create pull request to hub

### Phase 4: Post-Push Cleanup

1. **Delete local split branch**:
   ```bash
   git branch -D contrib-branch
   ```

2. **Update tracking** (optional):
   - Note contribution in project logs

3. **Report success**:
   ```
   ## Push Complete

   Branch: feature/[description]
   Commits: [N]
   Remote: [hub-remote or fork]

   Next steps:
   - Create pull request if using fork
   - Wait for review and merge
   - Pull after merge to update watermark
   ```

## Error Handling

| Error | Recovery |
|-------|----------|
| Version mismatch | Pull hub updates first |
| Uncommitted changes | Commit changes first |
| No push access | Use fork workflow |
| Split failed | Check subtree history |

## Push Guidelines

1. **Never force push to hub main**: Use feature branches
2. **Squash local commits**: Keep contribution clean
3. **Update version if needed**: For breaking changes
4. **Add to compatibility.yaml**: Document breaking changes

## Related Patterns

- `subtree-operations.md` - Core subtree commands
- `watermark-tracking.md` - Watermark format
- `version-compatibility-management` skill - Version checks
