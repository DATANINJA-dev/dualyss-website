---
name: bidirectional-sync-patterns
description: |
  High-level orchestration patterns for bidirectional hub-target synchronization.
  Auto-activates when implementing /framework push, /framework update, or handling
  multi-file sync scenarios between hub and target projects.

  Type: active (provides executable workflows)
---

# Bidirectional Sync Patterns Skill

This skill provides orchestration patterns for bidirectional framework synchronization using the hub-and-spoke topology. It combines low-level git operations from `git-sync-patterns` with file merging from `config-merging-patterns` into complete workflows.

## When This Skill Activates

- Implementing `/framework push` or `/framework update` commands
- Orchestrating multi-file sync operations between hub and targets
- Handling version divergence between hub and target projects
- User mentions "bidirectional sync", "push to hub", "pull from hub"
- Working on EPIC-011 Distribution CLI tasks (TASK-121-125)
- Implementing hub registry operations

## Core Principles

### 1. Version Check First

Always validate version compatibility before any sync operation:

```
Rule: Run /sync-check-version BEFORE pull or push
Block: E422 (Version incompatibility) blocks sync
```

### 2. Detect Before Modify

Never overwrite files without conflict detection:

```
Rule: Compute deltas, detect conflicts, report, then sync
Block: Conflicts require explicit user resolution
```

### 3. Never Auto-Merge Destructive Changes

Protect user customizations and prevent data loss:

```
Safe auto-merge: Independent additions to different paths
Manual required: Modify/modify, delete/modify conflicts
```

### 4. Provide Rollback Paths

Every sync operation should be reversible:

```
Backup: Created before destructive operations
Restore: /sync-rollback [timestamp]
```

### 5. Hub-and-Spoke Topology

One hub repository, multiple target projects:

```
Hub (simon_tools main)
    ├── Target Project A ←→ (sync-pull / sync-push)
    ├── Target Project B ←→ (sync-pull / sync-push)
    └── Target Project N ←→ (sync-pull / sync-push)

No peer-to-peer sync between targets.
```

## Quick Reference

| Operation | Pattern File | When to Use |
|-----------|--------------|-------------|
| Pull from hub | `hub-to-target.md` | Getting framework updates |
| Push to hub | `target-to-hub.md` | Contributing improvements |
| Resolve conflicts | `conflict-resolution.md` | When sync is blocked |
| Merge specific files | `merge-strategies.md` | File-type specific merging |

## Supporting Files

- `hub-to-target.md` - Complete pull workflow (hub → target)
- `target-to-hub.md` - Complete push workflow (target → hub)
- `conflict-resolution.md` - Resolution strategies and decision tree
- `merge-strategies.md` - File-type specific merging (JSON, YAML, MD)

## Integration Points

### EPIC-011 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-121 | `/framework install` uses hub-to-target patterns |
| TASK-122 | `/framework update` implements full pull workflow |
| TASK-123 | `/framework push` implements full push workflow |
| TASK-124 | `/framework status` uses conflict detection patterns |
| TASK-125 | Hub registry uses watermark tracking |

### Related Skills

| Skill | Relationship |
|-------|--------------|
| `git-sync-patterns` | Low-level git subtree operations (referenced) |
| `config-merging-patterns` | Three-way merge algorithm (referenced) |
| `version-compatibility-management` | SemVer validation (referenced) |
| `error-handling` | E4XX distribution error codes |

### Cross-Skill References

```
bidirectional-sync-patterns
    ├── references git-sync-patterns/subtree-operations.md
    ├── references git-sync-patterns/watermark-tracking.md
    ├── references git-sync-patterns/conflict-detection.md
    ├── references config-merging-patterns/three-way-merge.md
    └── references config-merging-patterns/mcp-merge.md
```

## Constraints

- **Clean working tree**: Sync operations require no uncommitted changes
- **Feature branch for push**: Never push directly to hub main/master
- **Watermark required**: Pull/push require valid watermark for delta calculation
- **Single prefix**: Only `.claude/` directory synced (no multiple prefixes)

## Error Codes (E420-E433 Range)

| Code | Message | Resolution |
|------|---------|------------|
| E420 | Invalid framework command | Check command syntax |
| E421 | Project not initialized | Run /framework install first |
| E422 | Version incompatibility | Update to compatible version |
| E423 | Sync conflict detected | Use conflict-resolution.md |
| E424 | Hub registry not found | Run /framework register |
| E425 | Target not registered | Register target project |
| E430 | Git subtree failed | Check git-sync-patterns |
| E431 | Network error | Check connectivity |
| E432 | Config merge failed | Use merge-strategies.md |
| E433 | CLAUDE.md parse error | Check section markers |

## Sources

This skill synthesizes patterns from:

1. **git-sync-patterns skill** - Git subtree operations
2. **config-merging-patterns skill** - Three-way merge algorithm
3. **EPIC-009 implementation** - Core sync engine patterns
4. **EPIC-010 implementation** - Configuration and installation patterns
