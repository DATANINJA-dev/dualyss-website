# Release Checklist

Maintainer checklist for releasing new framework versions.

## Pre-Release Checklist

Complete all items before tagging a release:

### Code Quality

```markdown
- [ ] All tests passing (if applicable)
- [ ] `/audit` score >= 8.0
- [ ] No critical or high-severity issues
- [ ] Code reviewed (self or peer)
```

### Documentation

```markdown
- [ ] CLAUDE.md version updated
- [ ] Changelog entry written
- [ ] Breaking changes documented (if any)
- [ ] Migration guide written (if MAJOR bump)
- [ ] New features documented
```

### Compatibility

```markdown
- [ ] `compatibility.yaml` updated
- [ ] Breaking changes listed in compatibility matrix
- [ ] Minimum supported version still accurate
- [ ] Deprecation warnings added (if removing features)
```

### Testing

```markdown
- [ ] Fresh install tested (empty project)
- [ ] Upgrade from N-1 version tested
- [ ] Upgrade from minimum supported version tested
- [ ] Rollback tested
- [ ] All sync commands work
```

---

## Release Process

### Step 1: Update Version in CLAUDE.md

```markdown
<!-- simon_tools_meta
version: 0.31.0          ← Update this
created: 2026-01-04
last_sync: 2026-01-13    ← Update this
-->
```

Location: Top of `CLAUDE.md` in comment block

### Step 2: Update compatibility.yaml

```yaml
# .claude/compatibility.yaml
versions:
  minimum: "0.25.0"      # Update if raising minimum
  current: "0.31.0"      # Update to new version

# Add breaking changes if MAJOR bump
breaking_changes:
  "1.0.0":
    - change: "Description"
      migration: "How to migrate"
      impact: "Who is affected"
```

### Step 3: Create Changelog Entry

```markdown
## [0.31.0] - 2026-01-13

### Added
- New `/sync-check-version` command for pre-sync validation
- Version compatibility checking before pull/push

### Changed
- Improved error messages for sync operations

### Fixed
- Fixed watermark parsing edge case

### Deprecated
- `/set-up` command (use `/refine` instead) - removal in 1.0.0
```

Follow [Keep a Changelog](https://keepachangelog.com/) format.

### Step 4: Tag Release

```bash
# Ensure clean working tree
git status

# Commit version bump
git add CLAUDE.md .claude/compatibility.yaml CHANGELOG.md
git commit -m "Release v0.31.0"

# Tag with annotation
git tag -a v0.31.0 -m "Release v0.31.0

Changes:
- Added /sync-check-version command
- Improved error messages
- Fixed watermark parsing"

# Push with tags
git push origin main --tags
```

### Step 5: Push to Hub

```bash
# If using hub distribution model
/sync-push release/v0.31.0

# Create PR for review
gh pr create --title "Release v0.31.0" --body "See CHANGELOG.md"
```

---

## Post-Release Verification

### Verify Fresh Install

```bash
# In a new/empty project
mkdir test-fresh && cd test-fresh
git init

# Install framework
/sync-remote https://github.com/DATANINJA-dev/simon_tools.git
/sync-add

# Verify
/help
# All commands should work
```

### Verify Upgrade from N-1

```bash
# In a project with previous version
/sync-status
# Shows: Current version 0.30.0

/sync-pull
# Upgrades to 0.31.0

/help
# All commands should work
```

### Verify Documentation

```markdown
- [ ] Version number correct in CLAUDE.md
- [ ] Changelog accessible
- [ ] New features documented in Notes section
- [ ] Breaking changes clearly marked
```

### Announce Release (if applicable)

```markdown
- [ ] Update project README (if separate)
- [ ] Notify users (if distribution list exists)
- [ ] Update examples/tutorials (if any)
```

---

## Hotfix Process

For emergency patches to fix critical bugs:

### 1. Create Hotfix Branch

```bash
# From the release tag
git checkout -b hotfix/0.31.1 v0.31.0

# Or from main if already merged
git checkout -b hotfix/0.31.1 main
```

### 2. Make Minimal Fix

```bash
# Fix ONLY the critical issue
# No new features
# No refactoring
```

### 3. Test Thoroughly

```bash
# Test the specific fix
# Test that nothing else broke
/audit:quick
```

### 4. Release Hotfix

```bash
# Update version to patch
# CLAUDE.md: version: 0.31.1

# Commit and tag
git commit -am "Hotfix v0.31.1: Fix [issue]"
git tag -a v0.31.1 -m "Hotfix: [description]"

# Push
git push origin hotfix/0.31.1 --tags

# Merge to main
git checkout main
git merge hotfix/0.31.1
git push origin main
```

### 5. Notify Users

```markdown
## [0.31.1] - 2026-01-13 (Hotfix)

### Fixed
- Critical: [Description of fix]

**Recommended**: All users on 0.31.0 should upgrade immediately.
```

---

## Version Bump Quick Reference

### When to Bump What

| Change Type | Bump | Example |
|-------------|------|---------|
| Remove feature | MAJOR | Removing /set-up |
| Change behavior (breaking) | MAJOR | Error format change |
| Add feature | MINOR | New command |
| Add optional flag | MINOR | --verbose flag |
| Fix bug | PATCH | Error message fix |
| Documentation only | PATCH | README update |
| Hotfix | PATCH | Critical bug fix |

### Version Update Locations

| Location | Field | Update When |
|----------|-------|-------------|
| `CLAUDE.md` | `version:` in meta | Every release |
| `CLAUDE.md` | `last_sync:` in meta | Every release |
| `compatibility.yaml` | `versions.current` | Every release |
| `compatibility.yaml` | `versions.minimum` | When raising floor |
| `compatibility.yaml` | `breaking_changes` | MAJOR releases |
| `CHANGELOG.md` | New section | Every release |

---

## Checklist Templates

### Minor Release Template

```markdown
## Pre-Release (Minor)
- [ ] Tests passing
- [ ] /audit score >= 8.0
- [ ] CLAUDE.md version updated to X.Y.0
- [ ] compatibility.yaml current updated
- [ ] Changelog entry added
- [ ] New features documented

## Release
- [ ] Committed version bump
- [ ] Tagged vX.Y.0
- [ ] Pushed to origin with tags

## Post-Release
- [ ] Fresh install verified
- [ ] Upgrade from N-1 verified
- [ ] Documentation complete
```

### Major Release Template

```markdown
## Pre-Release (Major)
- [ ] Tests passing
- [ ] /audit score >= 8.0
- [ ] CLAUDE.md version updated to X.0.0
- [ ] compatibility.yaml current updated
- [ ] Breaking changes listed in compatibility.yaml
- [ ] Migration guide written
- [ ] Deprecation period completed (if applicable)
- [ ] Changelog entry with ### Breaking Changes

## Release
- [ ] Committed version bump
- [ ] Tagged vX.0.0
- [ ] Pushed to origin with tags

## Post-Release
- [ ] Fresh install verified
- [ ] Upgrade from minimum supported tested
- [ ] Migration guide verified
- [ ] Breaking changes communicated
```

### Hotfix Template

```markdown
## Hotfix
- [ ] Critical issue identified
- [ ] Hotfix branch created from release tag
- [ ] Minimal fix applied
- [ ] /audit:quick passes
- [ ] Version bumped to X.Y.Z
- [ ] Tagged vX.Y.Z
- [ ] Merged to main
- [ ] Users notified
```

---

## Related Files

| File | Purpose |
|------|---------|
| `versioning.md` | Version bump rules |
| `upgrade-paths.md` | Testing upgrades |
| `rollback.md` | Recovery if release fails |
| `CLAUDE.md` | Version source |
| `compatibility.yaml` | Constraint definitions |
