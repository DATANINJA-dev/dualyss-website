# Target-to-Hub Sync Pattern (Push Operations)

Push improvements from a target project back to the hub repository. This pattern implements the complete workflow for `/framework push` and `/sync-push` commands.

## When to Push

- You've made improvements that benefit other projects
- Fixed a bug in framework components
- Added a new command, agent, skill, or hook
- Refined documentation or patterns

## Pre-Push Checklist

Before initiating a push operation:

```
[ ] On a feature branch (NOT main/master/develop)
[ ] All changes committed locally
[ ] Tests pass (if applicable)
[ ] Changes are framework-general (not project-specific)
[ ] Hub remote configured (`git remote -v | grep simon_tools`)
```

## Safety Rules

### Rule 1: Never Push to Protected Branches

```
BLOCKED branches: main, master, develop

/sync-push main → [ERROR] E423: Cannot push to protected branch
/sync-push feature/my-fix → [OK] Proceeds to push
```

### Rule 2: Always Use Feature Branch

```bash
# Good: Feature branch with descriptive name
git checkout -b feature/improve-audit-command
# ... make changes ...
/sync-push feature/improve-audit-command

# Bad: Direct push attempt
/sync-push main  # BLOCKED
```

### Rule 3: Squash is Contributor Choice

Unlike pull (where squash is recommended), push can preserve full history:

```bash
# With squash (cleaner hub history)
/sync-push feature/my-fix --squash

# Without squash (preserves development history)
/sync-push feature/my-fix
```

## Push Workflow Phases

### Phase 0: Branch Validation

**Critical**: Block push to protected branches.

```
If branch in [main, master, develop]:
  [ERROR] E423: Cannot push to protected branch
  Suggest: Create feature branch first

If branch is valid:
  Proceed to Phase 1
```

### Phase 1: Diff Calculation

Calculate what you're contributing:

```bash
# Get changes to push (local vs hub)
git diff simon_tools/main...HEAD -- .claude/

# List modified files
git diff --name-status simon_tools/main...HEAD -- .claude/
```

Output:
```
Files to push:
  M .claude/commands/audit.md (+15 -3)
  A .claude/skills/new-skill/SKILL.md (new file)
```

### Phase 2: Conflict Awareness Report

**Important**: Unlike pull, push conflicts are **informational only**. Hub maintainer will resolve during PR review.

```
## Push Preview

### Your Changes
| File | Change | Lines |
|------|--------|-------|
| .claude/commands/audit.md | modified | +15 -3 |
| .claude/skills/new-skill/ | added | +120 |

### Potential Conflicts (Hub has changes)
| File | Hub Change | Your Change | Status |
|------|------------|-------------|--------|
| .claude/commands/audit.md | modified | modified | WARN |

Note: Conflicts will be resolved during PR review.
Hub maintainer may request changes.
```

### Phase 3: Split and Push

Extract `.claude/` subtree and push to hub:

```bash
# Split subtree to temporary branch
git subtree split --prefix=.claude -b _subtree_export

# Push to hub feature branch
git push simon_tools _subtree_export:[feature-branch]

# Cleanup temporary branch
git branch -D _subtree_export
```

Alternative using subtree push directly:

```bash
git subtree push --prefix=.claude simon_tools [feature-branch]
```

### Phase 4: PR Guidance

After push succeeds, guide user to create PR:

```
## Push Complete

Branch pushed: feature/improve-audit → simon_tools/feature/improve-audit

### Next Steps

1. Create PR on hub repository:
   gh pr create --repo [hub-repo] --head feature/improve-audit --base main

2. PR title suggestion:
   [TASK-XXX] Improve audit command output formatting

3. Include in PR body:
   - What changed and why
   - Testing performed
   - Breaking changes (if any)

### Quick PR Command
gh pr create --title "[TASK-XXX] [description]" --body "..."
```

## Examples

### Example 1: Clean Push (New Feature)

```
$ /sync-push feature/add-seo-validation

Phase 0: Branch validation... [OK]
Phase 1: Calculating diff...
  Files to push: 3
Phase 2: Conflict check...
  Hub conflicts: 0

## Push Preview

| File | Change | Lines |
|------|--------|-------|
| .claude/commands/seo-validate.md | added | +85 |
| .claude/agents/seo-analyzer.md | added | +120 |
| .claude/skills/seo-validation/SKILL.md | added | +45 |

Proceed? [Y/n]

Phase 3: Pushing to hub...
  Counting objects: done
  Writing objects: done

Push complete.

## Create PR

Run: gh pr create --repo owner/simon_tools --head feature/add-seo-validation
```

### Example 2: Push with Conflict Awareness

```
$ /sync-push feature/audit-improvements

Phase 0: Branch validation... [OK]
Phase 1: Calculating diff...
  Files to push: 1
Phase 2: Conflict check...

## Conflict Awareness

Hub has also modified these files:

| File | Your Change | Hub Change | Conflict Type |
|------|-------------|------------|---------------|
| .claude/commands/audit.md | lines 45-60 | lines 50-55 | modify/modify |

This will NOT block push. Hub maintainer will review.
You may be asked to rebase before merge.

Proceed anyway? [Y/n]

Phase 3: Pushing to hub...

Push complete with 1 potential conflict.
Expect rebase request during PR review.
```

### Example 3: Protected Branch Block

```
$ /sync-push main

[ERROR] E423: Cannot push to protected branch 'main'

Protected branches: main, master, develop

Solution:
1. Create a feature branch:
   git checkout -b feature/my-improvement

2. Push to feature branch:
   /sync-push feature/my-improvement

3. Create PR for hub maintainer review
```

## Bugfix Contribution Workflow

Special workflow for quick bugfixes:

```bash
# 1. Create bugfix branch
git checkout -b bugfix/fix-audit-timeout

# 2. Make minimal fix
# Edit .claude/commands/audit.md

# 3. Commit with clear message
git commit -m "[BUG] Fix timeout in audit command

- Increased timeout from 30s to 60s
- Added retry logic for transient failures"

# 4. Push to hub
/sync-push bugfix/fix-audit-timeout

# 5. Create PR
gh pr create --title "[BUG] Fix audit timeout" --label "bugfix"
```

## Quick Reference Checklist

### Before Push
- [ ] On feature/bugfix branch (not main)
- [ ] All changes committed
- [ ] Changes are framework-general
- [ ] Remove project-specific customizations

### During Push
- [ ] Review diff looks correct
- [ ] Note any conflict warnings
- [ ] Confirm push target branch

### After Push
- [ ] Create PR on hub repository
- [ ] Add clear description
- [ ] Respond to review feedback
- [ ] Rebase if requested

## What NOT to Push

Avoid pushing project-specific content:

| Do Push | Don't Push |
|---------|------------|
| Generic commands | Project-specific commands |
| Reusable skills | Local customizations |
| Bug fixes | `.mcp.local.json` |
| Documentation improvements | Project secrets |
| General patterns | Personal preferences |

## Error Codes

| Code | Situation | Resolution |
|------|-----------|------------|
| E423 | Push to protected branch | Create feature branch first |
| E425 | Target not registered | Register with `/framework register` |
| E430 | Git subtree failed | Check git state, retry |
| E431 | Network error | Check connectivity |

## Related Commands

| Command | Purpose |
|---------|---------|
| `/sync-status` | View changes before push |
| `/sync-push` | Execute push workflow |
| `/sync-watermark` | View sync state |
| `gh pr create` | Create pull request on hub |

## PR Template Suggestion

When creating PR on hub:

```markdown
## Summary

[One-line description of what this contributes]

## Changes

| File | Change Type | Description |
|------|-------------|-------------|
| [file] | [added/modified] | [what changed] |

## Testing

- [ ] Tested locally in target project
- [ ] No breaking changes
- [ ] Documentation updated

## Context

- Task: TASK-XXX (if applicable)
- Related: #issue-number (if applicable)

---

Contributed from: [target project name]
```
