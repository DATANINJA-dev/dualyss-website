# Framework Versioning Patterns

SemVer patterns for framework releases, including version numbering strategy, pre-release conventions, and version increment decision trees.

## Version Numbering Strategy

### SemVer 2.0.0 Format

```
MAJOR.MINOR.PATCH[-prerelease][+build]

Examples:
0.30.0          # Standard release
0.31.0-alpha.1  # Alpha pre-release
1.0.0-rc.1      # Release candidate
1.0.0+build.123 # With build metadata
```

### When to Bump Each Component

| Component | Bump When | Example |
|-----------|-----------|---------|
| **MAJOR** | Breaking changes that require user action | Removing a command, changing behavior |
| **MINOR** | New features (backward compatible) | Adding a new command, new skill |
| **PATCH** | Bug fixes (backward compatible) | Fixing a typo, correcting behavior |

### Breaking Change Examples

| Change Type | Breaking? | Version Bump |
|-------------|-----------|--------------|
| Remove command | YES | MAJOR |
| Rename command | YES | MAJOR |
| Change command behavior | YES | MAJOR |
| Change required parameters | YES | MAJOR |
| Add optional parameter | NO | MINOR |
| Add new command | NO | MINOR |
| Add new skill | NO | MINOR |
| Fix bug in existing feature | NO | PATCH |
| Update documentation | NO | PATCH |

---

## Pre-Release Conventions

### Pre-Release Identifiers

```
Stability Hierarchy (least to most stable):
alpha < beta < rc < release

Format: MAJOR.MINOR.PATCH-<identifier>.<number>
```

| Identifier | Purpose | Stability |
|------------|---------|-----------|
| `alpha` | Early testing, incomplete features | Lowest |
| `beta` | Feature complete, needs testing | Medium |
| `rc` | Release candidate, final testing | High |
| (none) | Stable release | Highest |

### Pre-Release Versioning Rules

```
0.30.0-alpha.1  →  0.30.0-alpha.2  # Alpha iterations
0.30.0-alpha.3  →  0.30.0-beta.1   # Promote to beta
0.30.0-beta.2   →  0.30.0-rc.1     # Promote to RC
0.30.0-rc.2     →  0.30.0          # Final release
```

### Pre-Release Constraints

```yaml
# Pre-release versions are NEVER auto-upgraded
# Users must explicitly opt-in to pre-release

# In compatibility.yaml:
constraints:
  - version: "^0.30.0"       # Matches 0.30.x stable only
  - version: "^0.30.0-0"     # Matches 0.30.x including pre-releases
```

---

## Version Sources

### Primary Source: CLAUDE.md Metadata

```markdown
<!-- simon_tools_meta
version: 0.30.0
created: 2026-01-04
last_sync: 2026-01-11
-->
```

Location: `CLAUDE.md` header comment block

### Secondary Source: compatibility.yaml

```yaml
# .claude/compatibility.yaml
versions:
  minimum: "0.25.0"    # Oldest supported version
  current: "0.30.0"    # Current framework version

constraints:
  - version: "^0.30.0"
    reason: "Current release series"
```

Location: `.claude/compatibility.yaml`

### Version Extraction Pattern

```javascript
// From CLAUDE.md metadata
const versionRegex = /version:\s*["']?(\d+\.\d+\.\d+(?:-[\w.]+)?)/;
const match = claudeMd.match(versionRegex);
const version = match ? match[1] : null;

// From compatibility.yaml
const config = yaml.parse(compatibilityYaml);
const currentVersion = config.versions.current;
```

Reference: `version-compatibility-management/semver-patterns.md` for full parsing

---

## Version Increment Decision Tree

Use this flowchart to determine the correct version bump:

```
START: What changed?
    │
    ├─ Did you REMOVE anything users depend on?
    │   ├─ YES → MAJOR bump
    │   └─ NO ↓
    │
    ├─ Did you CHANGE existing behavior?
    │   ├─ YES → Is the change backward compatible?
    │   │   ├─ NO → MAJOR bump
    │   │   └─ YES ↓
    │   └─ NO ↓
    │
    ├─ Did you ADD new features?
    │   ├─ YES → MINOR bump
    │   └─ NO ↓
    │
    └─ Only bug fixes or docs?
        └─ YES → PATCH bump
```

### Decision Examples

| Scenario | Questions | Result |
|----------|-----------|--------|
| Removed `/set-up` command | Removed something? YES | MAJOR |
| Added `/validate-journeys` command | Added new feature? YES | MINOR |
| Fixed typo in error message | Only fixes? YES | PATCH |
| Changed `/audit` default behavior | Changed behavior + Not backward compatible | MAJOR |
| Added `--verbose` flag to commands | Added new feature? YES | MINOR |

---

## Version Bump Examples

### Example 1: MAJOR Bump (Breaking Change)

**Scenario**: Removing deprecated `/set-up` command

```yaml
# Before: 0.27.0
# After: 1.0.0 (if first major) or 0.28.0 → 1.0.0

Change:
  - Removed /set-up command
  - Users must use /refine instead

Migration:
  - Replace all /set-up calls with /refine
  - Functionality is identical

Changelog:
  ## [1.0.0] - 2026-01-15
  ### Breaking Changes
  - Removed `/set-up` command. Use `/refine` instead.
```

### Example 2: MINOR Bump (New Feature)

**Scenario**: Adding `/validate-journeys` command

```yaml
# Before: 0.40.0
# After: 0.41.0

Change:
  - Added new /validate-journeys command
  - No existing functionality affected

Changelog:
  ## [0.41.0] - 2026-01-12
  ### Added
  - New `/validate-journeys` command for route validation
```

### Example 3: PATCH Bump (Bug Fix)

**Scenario**: Fixing error message format

```yaml
# Before: 0.41.0
# After: 0.41.1

Change:
  - Fixed error code display in /list-tasks
  - Was showing "Error:" instead of "[ERROR] E001:"

Changelog:
  ## [0.41.1] - 2026-01-13
  ### Fixed
  - Error messages now use standardized format
```

### Example 4: Pre-Release

**Scenario**: Testing new feature before release

```yaml
# Before: 0.41.0
# After: 0.42.0-alpha.1

Change:
  - New experimental navigation validation feature
  - Not ready for production use

Changelog:
  ## [0.42.0-alpha.1] - 2026-01-13
  ### Added (Experimental)
  - Navigation pre-commit hook (alpha)
```

### Example 5: Post-0.x to 1.0

**Scenario**: Framework ready for stable release

```yaml
# Before: 0.42.0
# After: 1.0.0

Change:
  - All planned features implemented
  - API stable, no expected breaking changes
  - Ready for external adoption

Criteria for 1.0.0:
  - [ ] All EPIC-011 commands complete
  - [ ] Documentation complete
  - [ ] Migration path from 0.x documented
  - [ ] Test coverage adequate
```

---

## Quick Reference

### Version Bump Cheat Sheet

| Change | Bump |
|--------|------|
| Remove feature | MAJOR |
| Change behavior (breaking) | MAJOR |
| Add feature | MINOR |
| Add optional parameter | MINOR |
| Bug fix | PATCH |
| Documentation | PATCH |
| Refactoring (no behavior change) | PATCH |

### Pre-Release Progression

```
alpha.1 → alpha.2 → beta.1 → beta.2 → rc.1 → release
```

### Version Comparison

```
0.30.0 < 0.31.0 < 0.31.1 < 1.0.0-alpha < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

## Related Files

| File | Purpose |
|------|---------|
| `version-compatibility-management/semver-patterns.md` | SemVer parsing implementation |
| `upgrade-paths.md` | Safe upgrade workflows |
| `release-checklist.md` | Release process |
| `compatibility.yaml` | Version constraints |
