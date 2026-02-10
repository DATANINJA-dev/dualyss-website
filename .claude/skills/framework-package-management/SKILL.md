---
name: framework-package-management
description: |
  Provides framework versioning, package management, and distribution patterns.
  Auto-activates when versioning releases, planning upgrades, or managing
  framework lifecycle.

  Type: passive (reference patterns for distribution operations)
---

# Framework Package Management Skill

This skill provides patterns for managing the framework lifecycle: versioning, distribution, upgrades, downgrades, and dependency resolution. Used by distribution commands and release workflows.

## When This Skill Activates

- Publishing new framework versions
- Planning upgrade paths between versions
- Managing rollback or downgrade scenarios
- Resolving dependency constraints between framework and projects
- User mentions "release", "publish", "upgrade", "downgrade", "version bump"
- Working on EPIC-011 Distribution CLI tasks (TASK-121-125)
- Maintaining compatibility matrix entries

## Core Principles

### 1. Strict SemVer 2.0.0 Adherence

Follow semantic versioning precisely:

```
MAJOR.MINOR.PATCH[-prerelease][+build]

MAJOR: Breaking changes (removes commands, changes behavior)
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### 2. Deprecate Before Removing

Never remove features without deprecation notice:

```
Timeline:
1. Version N: Feature deprecated (warning issued)
2. Version N+1: Feature removed (breaking change)

Minimum gap: 1 MINOR version between deprecation and removal
```

### 3. Provide Migration Paths

Every breaking change must include:
- Clear migration instructions
- Automatic migration where possible (codemods)
- Rollback option for failed migrations

### 4. Test on Representative Targets

Before releasing:
- Fresh install on empty project
- Upgrade from N-1 version
- Upgrade from oldest supported version
- Mixed component scenarios

## Quick Reference

| Operation | Supporting File | Key Pattern |
|-----------|-----------------|-------------|
| Version bump decision | `versioning.md` | Decision tree for MAJOR/MINOR/PATCH |
| Safe upgrade | `upgrade-paths.md` | 5-phase upgrade workflow |
| Rollback | `rollback.md` | Recovery procedures |
| Constraint resolution | `dependency-resolution.md` | Satisfiability algorithm |
| Release process | `release-checklist.md` | Pre/post release checklist |

## Supporting Files

- `versioning.md` - SemVer patterns for framework releases
- `upgrade-paths.md` - Safe upgrade workflows and breaking change handling
- `rollback.md` - Downgrade and recovery patterns
- `dependency-resolution.md` - Constraint evaluation and conflict resolution
- `release-checklist.md` - Maintainer checklist for releases

## Integration Points

### EPIC-011 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-121 | `/framework install` uses versioning for initial setup |
| TASK-122 | `/framework update` uses upgrade-paths patterns |
| TASK-123 | `/framework push` uses release validation |
| TASK-124 | `/framework status` uses version display patterns |
| TASK-125 | Hub registry uses version tracking |

### Related Skills

| Skill | Relationship |
|-------|--------------|
| `version-compatibility-management` | SemVer parsing, constraint syntax (reference) |
| `bidirectional-sync-patterns` | Sync workflows that use versioning |
| `git-sync-patterns` | Git operations underlying distribution |
| `error-handling` | E420-E433 error codes for distribution |

### Cross-Skill References

```
framework-package-management
    ├── references version-compatibility-management/semver-patterns.md
    ├── references version-compatibility-management/compatibility-matrix.md
    ├── references bidirectional-sync-patterns/hub-to-target.md
    ├── references bidirectional-sync-patterns/target-to-hub.md
    └── references error-handling/error-codes.md (E420-E433)
```

## Error Codes (E420-E433)

Distribution operations use error codes in the E420-E433 range:

| Code | Message | Severity |
|------|---------|----------|
| E420 | Invalid framework command | Low |
| E421 | Project not initialized | Medium |
| E422 | Version incompatibility detected | High |
| E423 | Sync conflict detected | High |
| E424 | Hub registry not found | Medium |
| E425 | Target project not registered | Medium |
| E430 | Git subtree operation failed | High |
| E431 | Network error during sync | Medium |
| E432 | Configuration merge failed | High |
| E433 | CLAUDE.md section parse error | Medium |

Reference: `.claude/skills/error-handling/error-codes.md`

## Constraints

- **SemVer 2.0.0 only**: Do not support non-standard versioning schemes
- **No automatic MAJOR upgrades**: User must explicitly approve breaking changes
- **Pre-release versions**: Never auto-upgrade to pre-release in production
- **Deprecation period**: Minimum 1 MINOR version before removal
- **Rollback support**: All upgrades must be reversible within 1 version

## Sources

This skill synthesizes patterns from:

1. **Semantic Versioning 2.0.0 Specification**
   - URL: https://semver.org/
   - Used for: Core versioning rules

2. **npm Semantic Versioning**
   - URL: https://docs.npmjs.com/about-semantic-versioning/
   - Used for: Constraint syntax patterns

3. **Keep a Changelog**
   - URL: https://keepachangelog.com/
   - Used for: Release documentation patterns
