---
name: framework-migration-planning
description: Systematic framework for migrations and deprecations
type: passive
---

# framework-migration-planning

## Auto-Activation Triggers
- User mentions: "migration", "breaking change", "deprecation", "upgrade", "version", "backward compatibility"
- When planning framework changes
- During architecture refactoring
- When renaming commands or changing APIs

## Description
Provides systematic framework for planning and executing migrations, handling breaking changes, and managing deprecations. Covers risk assessment, dependency mapping, phased rollouts, and user communication strategies.

## Core Principles
1. **Backward Compatibility First** - Default to non-breaking changes whenever possible
2. **Deprecate Before Remove** - Always provide a transition period for users
3. **Clear Communication** - Document all changes prominently in CLAUDE.md and release notes
4. **Phased Rollouts** - Reduce blast radius with gradual adoption strategies
5. **Rollback Ready** - Every migration should be reversible with clear rollback steps
6. **User Empathy** - Consider impact on existing workflows and muscle memory

Use when:
- Planning command renaming
- Introducing breaking changes
- Deprecating features
- Major version upgrades

## When to Use This Skill
- **Breaking changes**: Renaming `/set-up` to `/refine`
- **Workflow changes**: Restructuring epic → task flow
- **Deprecation**: Removing old commands
- **Version upgrades**: simon_tools v0.23 → v1.0
- **User communication**: How to announce changes

## Constraints
- Does NOT provide automated migration scripts (implementation is manual)
- Does NOT cover data migrations (database schema changes)
- Focuses on framework/command-level changes
- Requires manual implementation of migration strategies
- Assumes single-developer or small team context (not enterprise-scale)

## Supporting Files
- pre-migration-checklist.md - Assessment before starting
- migration-strategies.md - Big bang vs phased vs trickle
- communication-plan.md - User announcements and guides

## Integration Points
- **version-compatibility-management**: SemVer constraint validation
- **git-sync-patterns**: Sync operations during upgrades
- **error-handling**: Consistent error codes for migration failures
- **config-merging-patterns**: CLAUDE.md section merging during upgrades
