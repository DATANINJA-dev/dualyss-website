---
name: writing-commands
description: Use when creating or editing Claude Code slash commands in .claude/commands/. Provides syntax, design patterns, tool selection, and validation guidance.
---

# Command Guide

This skill provides comprehensive guidance for creating and editing Claude Code commands.

## Essential Rules

1. **YAML frontmatter at top** - Must start with `---`
2. **Required field: `description`** - Needed for /help and Claude invocation
3. **Recommended: `allowed-tools`** - Restrict to only needed tools
4. **Use `argument-hint`** - When command takes arguments

## Quick Reference

| Field | Required | Example |
|-------|----------|---------|
| `description` | **Yes** | `"Create a git commit"` |
| `allowed-tools` | Recommended | `Glob, Read, Write` |
| `argument-hint` | If takes args | `[message]` |
| `model` | Optional | `claude-3-5-haiku-20241022` |

## Arguments

| Syntax | Use |
|--------|-----|
| `$ARGUMENTS` | All args as string |
| `$1`, `$2` | Positional args |

## Detailed References

For more detail, see these files in this skill folder:

| File | Content |
|------|---------|
| `syntax-reference.md` | Complete frontmatter, args, inline bash |
| `design-patterns.md` | Structure, phases, constraints, human-in-the-loop |
| `tool-selection.md` | Permissions, security, minimal tools |
| `checklist.md` | Pre/post validation checklist |

## Minimal Valid Command

```markdown
---
description: What this command does
allowed-tools: Read, Write
---

# command-name

Instructions here...
```

## Common Mistakes

1. Frontmatter not at very top of file
2. Missing `description` field
3. Granting unnecessary tool permissions
4. No structure/phases in complex commands

See `checklist.md` for complete validation checklist.
