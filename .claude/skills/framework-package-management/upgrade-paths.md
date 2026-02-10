# Safe Upgrade Paths

Patterns for safely upgrading between framework versions, including pre-upgrade validation, phased execution, and breaking change handling.

## Upgrade Categories

### Patch Upgrades (Always Safe)

```
0.30.0 → 0.30.1
0.30.1 → 0.30.2

Characteristics:
- Bug fixes only
- No behavior changes
- No migration required
- Can be applied automatically
```

### Minor Upgrades (Add Features)

```
0.30.0 → 0.31.0
0.31.0 → 0.32.0

Characteristics:
- New features added
- Existing features unchanged
- Optional migration (to use new features)
- Safe to apply with review
```

### Major Upgrades (Breaking Changes)

```
0.x.y → 1.0.0
1.x.y → 2.0.0

Characteristics:
- Breaking changes present
- Migration required
- User must review changes
- Never auto-applied
```

---

## Pre-Upgrade Checklist

Before any upgrade, verify these conditions:

```markdown
## Pre-Upgrade Checklist

### Environment
- [ ] Clean working tree (no uncommitted changes)
- [ ] On appropriate branch (not main for testing)
- [ ] Backup exists (automatic via /sync-pull)

### Compatibility
- [ ] Version compatibility checked (/sync-check-version)
- [ ] Breaking changes reviewed (if major upgrade)
- [ ] Dependencies compatible

### Testing
- [ ] Test environment available
- [ ] Rollback procedure understood
- [ ] Time allocated for verification
```

### Quick Pre-Check Command

```bash
# Run before upgrade
/sync-check-version [target-version]
/sync-status
```

---

## Upgrade Workflow Phases

### 5-Phase Upgrade Process

```
Phase 1: Version Compatibility Check
    ↓
Phase 2: Backup Creation
    ↓
Phase 3: Pull New Version
    ↓
Phase 4: Run Migrations (if needed)
    ↓
Phase 5: Verify Installation
```

### Phase 1: Version Compatibility Check

```bash
# Check if upgrade is safe
/sync-check-version

# Output:
Current version: 0.30.0
Target version: 0.31.0
Upgrade type: MINOR (safe)

Compatibility: ✓ PASS
- Constraint ^0.25.0 satisfied
- No breaking changes detected
```

**If check fails**:
```
Current version: 0.25.0
Target version: 1.0.0
Upgrade type: MAJOR (breaking)

Compatibility: ⚠️ REVIEW REQUIRED
Breaking changes:
- /set-up command removed (use /refine)
- Error format changed

Migration guide: docs/migration-0.x-to-1.0.md
```

### Phase 2: Backup Creation

```bash
# Automatic backup created by /sync-pull
Backup location: .backup/pre-pull-2026-01-13T10-30-00/

Contents:
- .claude/ directory
- CLAUDE.md
- .mcp.json
```

**Manual backup** (if needed):
```bash
# Create manual backup
cp -r .claude .claude-backup-$(date +%Y%m%d)
cp CLAUDE.md CLAUDE.md.backup
```

### Phase 3: Pull New Version

```bash
# Execute upgrade
/sync-pull

# Progress:
Phase 1: Pre-flight checks... ✓
Phase 1.5: Conflict detection... ✓ (no conflicts)
Phase 2: Fetching from hub... ✓
Phase 3: Applying changes...
  - Updated: 15 files
  - Added: 3 files
  - Removed: 0 files
Phase 4: Updating watermark... ✓

Upgrade complete: 0.30.0 → 0.31.0
```

### Phase 4: Run Migrations (if needed)

For **MINOR** upgrades: Usually no migration required

For **MAJOR** upgrades:
```bash
# Check for migration script
cat .claude/migrations/0.x-to-1.0.md

# Common migrations:
# 1. Command renames
find . -name "*.md" -exec sed -i 's/\/set-up/\/refine/g' {} \;

# 2. Configuration updates
# Edit CLAUDE.md to update version references
```

### Phase 5: Verify Installation

```bash
# Verify upgrade success
/help                    # Commands available
/audit:quick             # Quick health check

# Expected output:
Framework version: 0.31.0
Commands: 25 available
Audit score: 8.5/10 ✓
```

---

## Handling Breaking Changes

### Breaking Change Workflow

```
1. Review breaking changes in changelog
    ↓
2. Check compatibility matrix for your usage
    ↓
3. Plan migration (estimate time/effort)
    ↓
4. Execute migration in test environment
    ↓
5. Verify all functionality works
    ↓
6. Apply to production
```

### Compatibility Matrix Reference

```yaml
# .claude/compatibility.yaml
breaking_changes:
  "1.0.0":
    - change: "Removed /set-up command"
      migration: "Replace with /refine"
      impact: "All users using /set-up"

    - change: "Error format standardized"
      migration: "Update error parsing if any"
      impact: "Scripts parsing error output"
```

Reference: `version-compatibility-management/compatibility-matrix.md`

### Migration Decision Tree

```
Is breaking change affecting you?
    │
    ├─ NO → Proceed with upgrade
    │
    └─ YES → Do you have time to migrate?
        │
        ├─ NO → Stay on current version
        │
        └─ YES → Follow migration guide
            │
            ├─ Test in non-production first
            │
            └─ Then apply to production
```

---

## Upgrade Examples

### Example 1: Patch Upgrade (0.30.0 → 0.30.1)

```bash
# Simple bug fix upgrade
/sync-check-version
# Output: PATCH upgrade, always safe

/sync-pull
# Output: Updated 2 files, no migration needed

# Verify
/help
# Commands working ✓
```

### Example 2: Minor Upgrade (0.30.0 → 0.31.0)

```bash
# New feature upgrade
/sync-check-version
# Output: MINOR upgrade, safe (new features added)

# Review new features
cat .claude/CHANGELOG.md | head -50
# New: /sync-check-version command added

/sync-pull
# Output: Updated 8 files, added 3 files

# Try new feature
/sync-check-version
# New command available ✓
```

### Example 3: Major Upgrade (0.x → 1.0.0)

```bash
# Breaking change upgrade
/sync-check-version 1.0.0
# Output: MAJOR upgrade, BREAKING CHANGES

# Review changes
Breaking changes detected:
1. /set-up removed → use /refine
2. Error codes renumbered (E001-E099 → E100-E199)

# Plan migration
# - Update any scripts using /set-up
# - Update error code references if any

# Test in branch first
git checkout -b test-v1-upgrade
/sync-pull

# Test critical workflows
/refine TASK-001
# Works ✓

# If satisfied, merge to main
git checkout main
git merge test-v1-upgrade
```

---

## Rollback Procedure

If upgrade fails or causes issues:

```bash
# Option 1: Use sync-rollback (recommended)
/sync-rollback --list          # Show available backups
/sync-rollback 2026-01-13T10-30-00

# Option 2: Git revert
git log --oneline -5           # Find pre-upgrade commit
git revert HEAD~1              # Revert last commit

# Option 3: Manual restore (last resort)
rm -rf .claude
cp -r .backup/pre-pull-2026-01-13T10-30-00/.claude .
cp .backup/pre-pull-2026-01-13T10-30-00/CLAUDE.md .
```

Reference: `rollback.md` for detailed recovery procedures

---

## Quick Reference

### Upgrade Safety Matrix

| From → To | Risk | Auto-Safe | Migration |
|-----------|------|-----------|-----------|
| Patch → Patch | None | Yes | No |
| Minor → Minor | Low | Yes | Optional |
| Major → Major | High | No | Required |
| Pre-release → Any | Medium | No | Review |

### Pre-Upgrade Commands

```bash
/sync-check-version [target]  # Check compatibility
/sync-status                  # Check for conflicts
/sync-pull --dry-run          # Preview changes
```

### Post-Upgrade Commands

```bash
/help                         # Verify commands
/audit:quick                  # Quick health check
/sync-status                  # Verify watermark
```

## Related Files

| File | Purpose |
|------|---------|
| `versioning.md` | Version bump rules |
| `rollback.md` | Recovery procedures |
| `release-checklist.md` | Release process |
| `version-compatibility-management/compatibility-matrix.md` | Breaking changes |
