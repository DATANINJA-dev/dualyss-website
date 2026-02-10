---
name: git-sync-patterns
description: |
  Provides git subtree operation patterns for bidirectional framework sync.
  Auto-activates when implementing sync commands, handling git subtree
  operations, or resolving sync conflicts.

  Type: active (provides executable patterns for Core Sync Engine)
---

# Git Sync Patterns Skill

This skill provides foundational patterns for bidirectional framework synchronization using git subtree. Used by sync commands, installation workflows, and conflict resolution agents.

## When This Skill Activates

- Implementing sync commands for framework distribution
- Handling git subtree add/pull/push operations
- Detecting or resolving sync conflicts
- Managing sync watermarks and state tracking
- User mentions "sync", "subtree", "bidirectional"
- Working on EPIC-009 Core Sync Engine tasks

## Core Principles

### 1. Git Subtree Over Submodules

Git subtree provides cleaner bidirectional sync without requiring consumers to understand submodules:

```
Subtree advantages:
- No .gitmodules file in target project
- Contributors don't need special clone commands
- Bidirectional contributions via push
- Full history preserved (or squashed for cleaner log)
```

### 2. Squash Commits for Clean History

Use `--squash` on add/pull to keep target project history readable:

```bash
# Squash consolidates all framework commits into one
git subtree add --prefix=.claude <url> main --squash

# Target log shows single "Squashed commit" instead of 100+ commits
```

### 3. Watermark Tracking for Delta Detection

Track last-known-good sync state to enable efficient delta detection:

```yaml
<!-- simon_tools_meta
version: 0.28.0
last_sync: 2026-01-09T12:00:00Z
sync_watermark: abc123def456
-->
```

### 4. Detect Before Resolve

Always detect conflicts before attempting sync. Never overwrite without explicit consent:

```
1. Calculate deltas (hub vs local since watermark)
2. Identify conflicts (same files modified both sides)
3. Report conflicts to user
4. Block sync if conflicts exist (manual resolution required)
```

### 5. Hub-and-Spoke Topology

One hub repository, multiple target projects. No peer-to-peer sync:

```
Hub (simon_tools main)
    ├── Target Project A
    ├── Target Project B
    └── Target Project N
```

## Quick Reference

| Operation | Command | When to Use |
|-----------|---------|-------------|
| Check version | `/sync-check-version` | Before any sync operation |
| Initial install | `git subtree add --prefix=.claude <url> main --squash` | First time setup |
| Pull updates | `git subtree pull --prefix=.claude <url> main --squash` | Get hub changes |
| Push improvements | `git subtree push --prefix=.claude <url> <branch>` | Contribute back |
| Split for export | `git subtree split --prefix=.claude -b export` | Prepare for push |

## Supporting Files

- `subtree-operations.md` - Detailed add/pull/push patterns with examples
- `watermark-tracking.md` - Sync state tracking and watermark format
- `delta-detection.md` - SyncDelta algorithm with SHA-256 hashing and mtime optimization
- `conflict-detection.md` - Conflict identification and reporting patterns

### Workflows

- `workflows/sync-pull.md` - Complete pull workflow with version check (Phase 0)
- `workflows/sync-push.md` - Complete push workflow with version validation

## Integration Points

### EPIC-009 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-074 | Git subtree wrapper commands use `subtree-operations.md` |
| TASK-075 | Delta detection uses watermark patterns |
| TASK-076 | Version compatibility checker (sync-check-version command) |
| TASK-077 | Sync watermark + conflict detection |

### Related Skills

- `version-compatibility-management` (TASK-073) - Version checks before sync

## Constraints

- **Minimum git version**: 1.7.11+ (subtree support)
- **Single prefix only**: `.claude/` directory (not multiple prefixes)
- **No nested subtrees**: Don't add subtree inside another subtree
- **Squash required for pull**: Target projects use `--squash` to keep history clean
- **No force push to hub main**: Contributions go to feature branches

## Sources

This skill synthesizes patterns from authoritative git subtree documentation:

1. **Atlassian Git Subtree Tutorial**
   - URL: https://www.atlassian.com/git/tutorials/git-subtree
   - Authority: Industry-leading git documentation
   - Used for: Core add/pull/push patterns

2. **Mastering Git Subtrees (Medium)**
   - URL: https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec
   - Authority: Christophe Porteneuve (Git expert, author)
   - Used for: Bidirectional workflow patterns, advanced techniques

3. **GitHub Git Subtree Basics Gist**
   - URL: https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202
   - Authority: Community-validated patterns
   - Used for: Practical edge cases, troubleshooting
