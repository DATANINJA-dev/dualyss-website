# Rollback & Downgrade Patterns

Recovery procedures for failed upgrades, version downgrades, and emergency restoration.

## When to Rollback

### Rollback Triggers

| Situation | Severity | Action |
|-----------|----------|--------|
| Upgrade broke critical functionality | HIGH | Immediate rollback |
| New version has blocking bugs | HIGH | Rollback + report |
| Incompatible with project dependencies | MEDIUM | Rollback or wait for fix |
| Performance regression | MEDIUM | Evaluate trade-offs |
| Minor issues, workarounds exist | LOW | Consider staying |

### Decision Criteria

```
Should I rollback?
    │
    ├─ Is production blocked?
    │   └─ YES → Immediate rollback
    │
    ├─ Can you work around the issue?
    │   └─ YES → Consider staying, report bug
    │
    ├─ Is a fix coming soon?
    │   └─ YES → Wait if not urgent
    │
    └─ None of the above?
        └─ Rollback to restore stability
```

---

## Rollback Methods

### Method 1: /sync-rollback Command (Recommended)

The `/sync-rollback` command restores from automatic backups created before sync operations.

```bash
# List available backups
/sync-rollback --list

Available backups:
| Timestamp | Operation | Version | Files |
|-----------|-----------|---------|-------|
| 2026-01-13T10-30-00 | sync-pull | 0.30.0→0.31.0 | 18 |
| 2026-01-12T15-45-00 | sync-scaffold | fresh | 25 |

# Restore specific backup
/sync-rollback 2026-01-13T10-30-00

# Preview without applying
/sync-rollback 2026-01-13T10-30-00 --dry-run

# Keep backup after restore (default: delete)
/sync-rollback 2026-01-13T10-30-00 --keep
```

**What gets restored**:
- `.claude/` directory (commands, agents, skills, hooks)
- `CLAUDE.md` file
- `.mcp.json` configuration
- Watermark state

### Method 2: Git Revert (Clean History)

Use when you want to preserve git history with explicit revert commits.

```bash
# Find the upgrade commit
git log --oneline -10

# Output:
abc1234 [sync-pull] Updated to 0.31.0
def5678 [TASK-119] Add bidirectional-sync-patterns

# Revert the upgrade commit
git revert abc1234

# Or revert multiple commits
git revert HEAD~2..HEAD
```

**Advantages**:
- Clean git history
- Audit trail of rollback
- Easy to re-apply later

### Method 3: Git Reset (Emergency)

Use only when you need to completely undo changes and don't care about history.

```bash
# WARNING: Destructive operation
# Find pre-upgrade commit
git log --oneline -10

# Hard reset to pre-upgrade state
git reset --hard def5678

# Force push if already pushed (DANGEROUS)
git push --force  # Only if sole contributor
```

**Warning**: This rewrites history. Never use on shared branches.

### Method 4: Manual Restore (Last Resort)

When automated methods fail:

```bash
# Locate backup directory
ls .backup/

# Restore files manually
rm -rf .claude
cp -r .backup/pre-pull-2026-01-13T10-30-00/.claude .
cp .backup/pre-pull-2026-01-13T10-30-00/CLAUDE.md .

# Restore MCP config if needed
cp .backup/pre-pull-2026-01-13T10-30-00/.mcp.json .

# Update watermark manually
# Edit CLAUDE.md simon_tools_meta section
```

---

## Rollback Workflow

### Standard Rollback Process

```
Phase 1: Identify Target Version
    ↓
Phase 2: Check Rollback Feasibility
    ↓
Phase 3: Execute Rollback
    ↓
Phase 4: Verify Restoration
```

### Phase 1: Identify Target Version

```bash
# Check current version
grep "version:" CLAUDE.md
# version: 0.31.0

# List available rollback points
/sync-rollback --list

# Or check git history
git log --oneline --grep="sync-pull" -5
```

### Phase 2: Check Rollback Feasibility

```markdown
## Rollback Feasibility Checklist

### Data Considerations
- [ ] No irreversible data migrations in new version
- [ ] No new files created that are now in use
- [ ] No database schema changes (if applicable)

### Dependency Considerations
- [ ] Older version compatible with current dependencies
- [ ] No new features being actively used
- [ ] Team notified of rollback (if applicable)

### Risk Assessment
- [ ] Rollback tested in non-production (if possible)
- [ ] Recovery plan if rollback fails
```

### Phase 3: Execute Rollback

```bash
# Recommended method
/sync-rollback 2026-01-13T10-30-00

# Output:
Restoring from backup: pre-pull-2026-01-13T10-30-00

Files to restore:
  .claude/commands/     (12 files)
  .claude/agents/       (8 files)
  .claude/skills/       (15 files)
  CLAUDE.md

Proceed with rollback? [Y/n]
> Y

Restoring... ████████████████████ 100%

Rollback complete.
Previous version: 0.31.0
Restored version: 0.30.0
```

### Phase 4: Verify Restoration

```bash
# Verify version
grep "version:" CLAUDE.md
# version: 0.30.0 ✓

# Verify commands work
/help
# Commands available ✓

# Quick audit
/audit:quick
# Score: 8.5/10 ✓

# Verify specific functionality that was broken
/refine TASK-001 --dry-run
# Works ✓
```

---

## Data Migration Concerns

### What CAN Be Rolled Back

| Component | Rollback Safe | Notes |
|-----------|---------------|-------|
| Commands | ✓ Yes | File-based, no state |
| Agents | ✓ Yes | File-based, no state |
| Skills | ✓ Yes | File-based, no state |
| Hooks | ✓ Yes | File-based, no state |
| CLAUDE.md | ✓ Yes | Single file |
| .mcp.json | ✓ Yes | Single file |

### What CANNOT Be Rolled Back

| Component | Rollback Safe | Mitigation |
|-----------|---------------|------------|
| External state (GitHub, DB) | ✗ No | Manual cleanup |
| Generated files outside .claude/ | ✗ No | Manual removal |
| System dependencies installed | ✗ No | Manual uninstall |

### Handling Non-Reversible Changes

```markdown
## Non-Reversible Change Checklist

If the upgrade made changes outside the framework:

1. [ ] Identify external changes made
   - GitHub issues/PRs created?
   - External APIs called?
   - Files generated outside .claude/?

2. [ ] Plan manual cleanup
   - Close/delete created resources
   - Revert external changes
   - Remove generated files

3. [ ] Document for future
   - Note in upgrade documentation
   - Consider adding rollback support
```

---

## Emergency Recovery

### Scenario: Complete Corruption

If framework state is completely corrupted:

```bash
# 1. Remove corrupted state
rm -rf .claude
rm CLAUDE.md
rm .mcp.json

# 2. Fresh install from hub
/sync-add hub https://github.com/DATANINJA-dev/simon_tools.git

# 3. Restore local customizations from backup
cp .backup/latest/.mcp.local.json .
/sync-mcp-merge
```

### Scenario: No Backup Available

```bash
# 1. Check git for previous state
git log --all --oneline -- .claude/

# 2. Checkout specific version
git checkout abc1234 -- .claude/ CLAUDE.md

# 3. Or clone fresh from hub
git clone https://github.com/DATANINJA-dev/simon_tools.git temp-simon
cp -r temp-simon/.claude .
rm -rf temp-simon
```

### Scenario: Watermark Mismatch

```bash
# If watermark is out of sync with actual files
/sync-watermark --update --force

# This recalculates watermark from current state
# Use with caution - may lose sync tracking
```

---

## Quick Reference

### Rollback Commands

| Command | Purpose |
|---------|---------|
| `/sync-rollback --list` | Show available backups |
| `/sync-rollback [TIMESTAMP]` | Restore from backup |
| `/sync-rollback [TIMESTAMP] --dry-run` | Preview restore |
| `/sync-rollback [TIMESTAMP] --keep` | Restore and keep backup |
| `/sync-rollback --cleanup` | Apply retention policy |

### Rollback Decision Matrix

| Situation | Method | Risk |
|-----------|--------|------|
| Recent failed upgrade | /sync-rollback | Low |
| Upgrade commit exists | git revert | Low |
| Need clean slate | git reset | Medium |
| No backups available | Manual restore | High |

### Retention Policy

Default backup retention:
```yaml
backup:
  max_count: 5          # Keep last 5 backups
  max_age_days: 30      # Delete backups older than 30 days
```

## Related Files

| File | Purpose |
|------|---------|
| `upgrade-paths.md` | Upgrade procedures |
| `versioning.md` | Version strategy |
| `.backup/` | Backup storage location |
| `config-merging-patterns/conflict-resolution-ui.md` | Conflict resolution |
