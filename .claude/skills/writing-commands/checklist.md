# Command Checklist

Use this checklist before and after writing commands.

## Contents
- [Pre-Write Checklist](#pre-write-checklist)
- [Post-Write Checklist](#post-write-checklist)
- [Common Mistakes](#common-mistakes)
- [Quick Validation](#quick-validation)
- [Template](#template)

## Pre-Write Checklist

Before creating a command, verify:

### Purpose
- [ ] Clear single purpose defined
- [ ] Not duplicating existing command functionality
- [ ] Appropriate scope (not too broad or narrow)

### Design
- [ ] Identified phases/steps
- [ ] Determined if human-in-the-loop needed
- [ ] Considered error cases
- [ ] Planned output/feedback

### Tools
- [ ] Listed minimum required tools
- [ ] Bash restrictions defined (if using Bash)
- [ ] Security implications considered

## Post-Write Checklist

After writing a command, verify:

### Frontmatter
- [ ] Starts with `---` at very top of file
- [ ] Has `description` field
- [ ] Has `allowed-tools` field (recommended)
- [ ] Has `argument-hint` if takes arguments
- [ ] Ends with `---`

### Structure
- [ ] Has clear title (`# command-name`)
- [ ] Has explanation of what command does
- [ ] Instructions are organized (phases if complex)
- [ ] Has constraints/critical rules section

### Tool Selection
- [ ] Only necessary tools included
- [ ] Bash has specific restrictions (not blanket access)
- [ ] No unnecessary Write/Edit access

### Arguments
- [ ] Uses `$ARGUMENTS` or positional args correctly
- [ ] Documents expected input format
- [ ] Handles missing/invalid arguments

### Human-in-the-Loop (if applicable)
- [ ] Asks for confirmation before destructive actions
- [ ] Shows draft/preview before executing
- [ ] Waits for explicit approval

### Error Handling
- [ ] Handles missing files/resources
- [ ] Handles invalid input
- [ ] Provides clear error messages

## Common Mistakes

### Syntax
| Mistake | Fix |
|---------|-----|
| Frontmatter not at top | Move `---` block to very first lines |
| Missing description | Add `description:` field |
| Unrestricted Bash | Use `Bash(command:*)` patterns |
| No argument-hint | Add `argument-hint: [arg]` if takes args |

### Design
| Mistake | Fix |
|---------|-----|
| No constraints section | Add "Critical Rules" section |
| Assumptions without asking | Add AskUserQuestion steps |
| No progress feedback | Add TodoWrite for complex tasks |
| Silent failures | Add explicit error handling |

### Security
| Mistake | Fix |
|---------|-----|
| Too many tools | Remove unnecessary tools |
| Blanket Bash access | Restrict to specific commands |
| No path validation | Add constraints for allowed paths |
| No confirmation for destructive ops | Add human-in-the-loop |

## Quick Validation

Run through these questions:

1. **Does it have frontmatter?** Check for `---` at top
2. **Does it have a description?** Required for discoverability
3. **Are tools minimal?** Remove any not actually used
4. **Is Bash restricted?** Never allow unrestricted Bash
5. **Are constraints explicit?** What should NOT happen?
6. **Is user confirmation needed?** For anything destructive

## Template

Minimal valid command:

```markdown
---
description: What this command does
allowed-tools: Tool1, Tool2
argument-hint: [arg-if-needed]
---

# command-name

Brief explanation of the command.

## Instructions

1. First step
2. Second step
3. Final step

## Critical Rules

- NEVER do X without confirmation
- ALWAYS validate Y before Z
```
