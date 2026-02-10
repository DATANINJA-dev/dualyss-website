# Git Subtree Operations

Patterns for git subtree add, pull, and push operations in the framework distribution system.

## Overview

Git subtree enables bidirectional sync of the `.claude/` directory between hub (simon_tools) and target projects without requiring submodules. This file documents the core operations.

## Remote Repository Management

### Adding the Hub Remote (Recommended)

Add a named remote for cleaner commands:

```bash
# Add remote for hub repository
git remote add simon_tools https://github.com/DATANINJA-dev/simon_tools.git

# Verify remote
git remote -v
# Output:
# simon_tools    https://github.com/DATANINJA-dev/simon_tools.git (fetch)
# simon_tools    https://github.com/DATANINJA-dev/simon_tools.git (push)
```

**Benefits:**
- Shorter commands (`simon_tools` vs full URL)
- Easier to update URL if repo moves
- Clear intent in git log

## Subtree Add (Initial Installation)

### Pattern

```bash
git subtree add --prefix=.claude <remote> <branch> --squash
```

### Full Example

```bash
# With named remote (recommended)
git subtree add --prefix=.claude simon_tools master --squash

# With full URL
git subtree add --prefix=.claude https://github.com/DATANINJA-dev/simon_tools.git master --squash
```

### Options Explained

| Option | Purpose |
|--------|---------|
| `--prefix=.claude` | Target directory in local repo |
| `<remote>` | Hub repository (name or URL) |
| `<branch>` | Branch to pull from (usually `master`) |
| `--squash` | Consolidate history into single commit |

### When to Use

- First-time installation of framework in a target project
- Fresh clone needing framework setup

### Expected Output

```
git fetch simon_tools master
From https://github.com/DATANINJA-dev/simon_tools
 * branch            master     -> FETCH_HEAD
Added dir '.claude'
```

### Edge Cases

| Situation | Solution |
|-----------|----------|
| `.claude/` already exists | Delete or rename first, then add |
| Remote doesn't exist | Add remote first with `git remote add` |
| Permission denied | Check SSH keys or HTTPS credentials |
| Branch not found | Verify branch name exists on remote |

---

## Subtree Pull (Hub to Target Updates)

### Pattern

```bash
git subtree pull --prefix=.claude <remote> <branch> --squash
```

### Full Example

```bash
# Pull latest framework updates
git subtree pull --prefix=.claude simon_tools master --squash

# With message customization
git subtree pull --prefix=.claude simon_tools master --squash -m "Update simon_tools to v0.29.0"
```

### When to Use

- Updating target project with hub improvements
- After hub releases new version
- Regular sync schedule

### Expected Output (Success)

```
From https://github.com/DATANINJA-dev/simon_tools
 * branch            master     -> FETCH_HEAD
Merge made by the 'ort' strategy.
 .claude/commands/new-command.md | 50 ++++++++++
 1 file changed, 50 insertions(+)
 create mode 100644 .claude/commands/new-command.md
```

### Expected Output (No Changes)

```
From https://github.com/DATANINJA-dev/simon_tools
 * branch            master     -> FETCH_HEAD
Already up to date.
```

### Edge Cases

| Situation | Solution |
|-----------|----------|
| Merge conflicts | Resolve manually, then commit |
| Local modifications | Commit or stash local changes first |
| Divergent histories | May need `--allow-unrelated-histories` (rare) |

---

## Subtree Push (Target to Hub Contributions)

### Pattern

```bash
# Option 1: Direct push (may be slow for large repos)
git subtree push --prefix=.claude <remote> <branch>

# Option 2: Split then push (faster for large repos)
git subtree split --prefix=.claude -b export
git push <remote> export:<branch>
```

### Full Example

```bash
# Push improvements to a feature branch (never master directly)
git subtree push --prefix=.claude simon_tools feature/my-improvement

# Alternative: Split first (better for large repos)
git subtree split --prefix=.claude -b claude-export
git push simon_tools claude-export:feature/my-improvement
```

### When to Use

- Contributing improvements back to hub
- Creating PR from target project improvements
- Syncing local customizations upstream

### Expected Output

```
git push using:  simon_tools feature/my-improvement
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 1.23 KiB | 1.23 MiB/s, done.
Total 6 (delta 3), reused 0 (delta 0)
To https://github.com/DATANINJA-dev/simon_tools.git
 * [new branch]      feature/my-improvement -> feature/my-improvement
```

### Safety Rules

1. **Never push directly to master** - Always use feature branches
2. **Create PR for review** - Hub maintainer reviews before merge
3. **Clean up export branch** - Delete local export branch after push

```bash
# After successful push and PR merge
git branch -D claude-export
```

### Edge Cases

| Situation | Solution |
|-----------|----------|
| Push rejected | Use split+push method |
| No changes detected | Ensure commits exist in `.claude/` |
| Authentication failed | Check push permissions on hub |

---

## Subtree Split (Export Preparation)

### Pattern

```bash
git subtree split --prefix=.claude -b <branch-name>
```

### When to Use

- Preparing `.claude/` changes for push
- Isolating framework changes from project changes
- Large repositories where direct push is slow

### Full Example

```bash
# Split .claude/ history into dedicated branch
git subtree split --prefix=.claude -b claude-export

# Verify the split branch
git log claude-export --oneline -5

# Push to hub
git push simon_tools claude-export:feature/improvements

# Clean up
git branch -D claude-export
```

---

## Complete Workflow Examples

### Initial Setup

```bash
# 1. Add remote
git remote add simon_tools https://github.com/DATANINJA-dev/simon_tools.git

# 2. Add subtree
git subtree add --prefix=.claude simon_tools master --squash

# 3. Update watermark (in CLAUDE.md)
# See watermark-tracking.md
```

### Regular Update Cycle

```bash
# 1. Check for conflicts (see conflict-detection.md)

# 2. Pull updates
git subtree pull --prefix=.claude simon_tools master --squash

# 3. Update watermark
# See watermark-tracking.md
```

### Contribute Back

```bash
# 1. Make improvements to .claude/ files

# 2. Commit locally
git add .claude/
git commit -m "Improve: add new validation pattern"

# 3. Push to feature branch
git subtree push --prefix=.claude simon_tools feature/validation-pattern

# 4. Create PR on hub repository
```

---

## Source

Primary patterns from:
- [Atlassian Git Subtree Tutorial](https://www.atlassian.com/git/tutorials/git-subtree)
- [Mastering Git Subtrees](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec)
